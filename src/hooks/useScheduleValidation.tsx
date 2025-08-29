import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';

interface TimeSlot {
  date: string;
  time: string;
  duration: number;
}

export const useScheduleValidation = () => {
  const { handleError } = useErrorHandler();

  const validateTimeSlot = async (
    professionalId: string,
    slot: TimeSlot
  ): Promise<{ isValid: boolean; reason?: string }> => {
    try {
      const startTime = new Date(`${slot.date}T${slot.time}`);
      const endTime = new Date(startTime.getTime() + slot.duration * 60000);

      // Check for conflicts with existing appointments
      const { data: conflicts, error } = await supabase
        .from('appointments')
        .select('id, scheduled_at, duration_minutes')
        .eq('professional_id', professionalId)
        .eq('status', 'scheduled')
        .gte('scheduled_at', startTime.toISOString())
        .lt('scheduled_at', endTime.toISOString());

      if (error) {
        throw error;
      }

      if (conflicts && conflicts.length > 0) {
        return {
          isValid: false,
          reason: 'Horário já ocupado'
        };
      }

      // Check professional availability
      const dayOfWeek = startTime.getDay();
      const timeString = slot.time;

      const { data: availability, error: availError } = await supabase
        .from('availability_slots')
        .select('start_time, end_time')
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (availError) {
        throw availError;
      }

      if (!availability || availability.length === 0) {
        return {
          isValid: false,
          reason: 'Profissional não disponível neste dia'
        };
      }

      const isWithinAvailability = availability.some(slot => {
        return timeString >= slot.start_time && timeString <= slot.end_time;
      });

      if (!isWithinAvailability) {
        return {
          isValid: false,
          reason: 'Horário fora do expediente'
        };
      }

      // Check for time off
      const { data: timeOff, error: timeOffError } = await supabase
        .from('time_off')
        .select('start_date, end_date')
        .eq('professional_id', professionalId)
        .lte('start_date', slot.date)
        .gte('end_date', slot.date);

      if (timeOffError) {
        throw timeOffError;
      }

      if (timeOff && timeOff.length > 0) {
        return {
          isValid: false,
          reason: 'Profissional em período de folga'
        };
      }

      return { isValid: true };

    } catch (error) {
      handleError(error, 'schedule validation');
      return {
        isValid: false,
        reason: 'Erro ao validar horário'
      };
    }
  };

  const getAvailableSlots = async (
    professionalId: string,
    date: string,
    serviceDuration: number
  ): Promise<string[]> => {
    try {
      const dayOfWeek = new Date(date).getDay();
      
      // Get professional availability for this day
      const { data: availability, error } = await supabase
        .from('availability_slots')
        .select('start_time, end_time')
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (error || !availability || availability.length === 0) {
        return [];
      }

      // Generate time slots based on availability
      const slots: string[] = [];
      
      for (const avail of availability) {
        const start = avail.start_time;
        const end = avail.end_time;
        
        // Generate 30-minute intervals
        let current = start;
        while (current < end) {
          const slotEnd = addMinutes(current, serviceDuration);
          if (slotEnd <= end) {
            const validation = await validateTimeSlot(professionalId, {
              date,
              time: current,
              duration: serviceDuration
            });
            
            if (validation.isValid) {
              slots.push(current);
            }
          }
          current = addMinutes(current, 30);
        }
      }

      return slots;
    } catch (error) {
      handleError(error, 'getting available slots');
      return [];
    }
  };

  return {
    validateTimeSlot,
    getAvailableSlots
  };
};

// Helper function to add minutes to a time string
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  
  if (newHours >= 24) return '23:59';
  
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}