
import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useScheduleValidation } from '@/hooks/useScheduleValidation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateTimeSelectionProps {
  organizationId: string;
  professionalId: string;
  serviceId: string;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}

export const DateTimeSelection = ({ 
  organizationId,
  professionalId,
  serviceId,
  onSelect, 
  onBack 
}: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate time slots (example: 8:00 to 18:00)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) { // Não adiciona :30 para o último horário
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const checkAvailability = async (date: Date) => {
    if (!selectedDate) return;

    setLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const timeSlots = generateTimeSlots();

    // Se é organização demo, simula disponibilidade realista
    if (organizationId === 'demo-org-id') {
      // Não trabalha aos domingos
      if (dayOfWeek === 0) {
        setAvailableSlots([]);
        setLoading(false);
        return;
      }

      // Simula horários ocupados de forma mais realista
      const today = new Date();
      const isToday = isSameDay(date, today);
      const currentHour = today.getHours();
      
      // Horários base ocupados para demonstração
      const baseOccupiedTimes = ['09:00', '10:30', '14:00', '15:30', '16:30'];
      
      // Se é hoje, remove horários que já passaram
      let occupiedTimes = baseOccupiedTimes;
      if (isToday) {
        occupiedTimes = baseOccupiedTimes.filter(time => {
          const [hour] = time.split(':').map(Number);
          return hour > currentHour;
        });
      }

      // Diferentes padrões para diferentes dias da semana
      if (dayOfWeek === 6) { // Sábado - horários reduzidos
        const saturdaySlots = timeSlots.filter(time => {
          const [hour] = time.split(':').map(Number);
          return hour >= 9 && hour <= 13;
        });
        const slots: TimeSlot[] = saturdaySlots.map(time => ({
          time,
          available: !occupiedTimes.includes(time)
        }));
        setAvailableSlots(slots);
      } else {
        // Segunda a sexta - horário normal
        const slots: TimeSlot[] = timeSlots.map(time => {
          const [hour] = time.split(':').map(Number);
          
          // Remove horário de almoço (12:00 às 14:00)
          if (hour >= 12 && hour < 14) {
            return { time, available: false };
          }
          
          // Se é hoje, remove horários que já passaram
          if (isToday && hour <= currentHour) {
            return { time, available: false };
          }
          
          return {
            time,
            available: !occupiedTimes.includes(time)
          };
        });
        setAvailableSlots(slots);
      }
      
      setLoading(false);
      return;
    }

    try {
      // Get service duration
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single();

      const serviceDuration = service?.duration_minutes || 60;

      // Check professional availability slots for this day of week
      const { data: availabilitySlots } = await supabase
        .from('availability_slots')
        .select('start_time, end_time')
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      // Check for time off on this date
      const { data: timeOff } = await supabase
        .from('time_off')
        .select('*')
        .eq('professional_id', professionalId)
        .lte('start_date', dateStr)
        .gte('end_date', dateStr);

      // If professional has time off, no slots available
      if (timeOff && timeOff.length > 0) {
        setAvailableSlots([]);
        setLoading(false);
        return;
      }

      // Check existing appointments for this date and professional
      const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_at, duration_minutes')
        .eq('professional_id', professionalId)
        .gte('scheduled_at', `${dateStr}T00:00:00`)
        .lt('scheduled_at', `${dateStr}T23:59:59`)
        .in('status', ['scheduled', 'confirmed', 'in_progress']);

      // Create list of all booked time periods (considering duration)
      const bookedPeriods: { start: string; end: string }[] = [];
      appointments?.forEach(apt => {
        const startTime = format(parseISO(apt.scheduled_at), 'HH:mm');
        const duration = apt.duration_minutes || 60;
        const endTime = format(
          new Date(parseISO(apt.scheduled_at).getTime() + duration * 60000),
          'HH:mm'
        );
        bookedPeriods.push({ start: startTime, end: endTime });
      });

      // Filter time slots based on availability windows and conflicts
      const slots: TimeSlot[] = timeSlots.map(time => {
        // Check if this time slot is within professional availability
        const isWithinAvailability = availabilitySlots?.some(slot => {
          const slotStart = slot.start_time.substring(0, 5); // Get HH:mm format
          const slotEnd = slot.end_time.substring(0, 5);
          
          // Calculate end time for this appointment
          const appointmentEndTime = format(
            new Date(`2000-01-01T${time}:00`).getTime() + serviceDuration * 60000,
            'HH:mm'
          );
          
          return time >= slotStart && appointmentEndTime <= slotEnd;
        });

        // Check if this time conflicts with existing bookings
        const hasConflict = bookedPeriods.some(period => {
          const appointmentEndTime = format(
            new Date(`2000-01-01T${time}:00`).getTime() + serviceDuration * 60000,
            'HH:mm'
          );
          
          // Check for overlap
          return (time < period.end && appointmentEndTime > period.start);
        });

        return {
          time,
          available: (isWithinAvailability || availabilitySlots?.length === 0) && !hasConflict
        };
      });

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error checking availability:', error);
      // Fallback to basic booking check
      const { data: appointments } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .eq('professional_id', professionalId)
        .gte('scheduled_at', `${dateStr}T00:00:00`)
        .lt('scheduled_at', `${dateStr}T23:59:59`)
        .eq('status', 'scheduled');

      const bookedTimes = appointments?.map(apt => 
        format(parseISO(apt.scheduled_at), 'HH:mm')
      ) || [];

      const slots: TimeSlot[] = timeSlots.map(time => ({
        time,
        available: !bookedTimes.includes(time)
      }));

      setAvailableSlots(slots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate, professionalId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const disabledDays = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Para demo, desabilita domingos e dias passados
    if (organizationId === 'demo-org-id') {
      return date < today || date.getDay() === 0;
    }
    
    return date < today;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-semibold text-[#2A2621] mb-2">
          Escolha data e horário
        </h2>
        <p className="text-[#2A2621]/70 text-sm">
          Selecione o melhor dia e horário para você
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-[#FDFCFB] border border-[#E8E4E0] rounded-xl p-4 shadow-sm">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={disabledDays}
          locale={ptBR}
          className="mx-auto"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#2A2621]">
            <Clock className="w-4 h-4" />
            <span>
              Horários para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-[#2A2621]/70">
              Carregando horários disponíveis...
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-[#2A2621]/70">
              Nenhum horário disponível para esta data.
              {selectedDate.getDay() === 0 && organizationId === 'demo-org-id' && (
                <p className="text-sm mt-2">Não atendemos aos domingos.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-2 text-sm rounded-lg transition-all duration-200 ${
                    selectedTime === slot.time
                      ? 'bg-[#E6B800] hover:bg-[#E6B800]/90 text-white shadow-md'
                      : slot.available
                      ? 'border-[#E8E4E0] text-[#2A2621] hover:border-[#E6B800]/50 hover:shadow-sm'
                      : 'opacity-30'
                  }`}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-[#E8E4E0] text-[#2A2621] hover:bg-[#E8E4E0]/50 rounded-xl transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        {selectedDate && selectedTime && (
          <Button
            onClick={() => onSelect(format(selectedDate, 'yyyy-MM-dd'), selectedTime)}
            className="flex-1 bg-[#E6B800] hover:bg-[#E6B800]/90 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
