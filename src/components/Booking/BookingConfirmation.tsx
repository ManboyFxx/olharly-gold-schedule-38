
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Check, Calendar, Clock, User, Mail, Phone, Briefcase, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface BookingData {
  serviceId?: string;
  professionalId?: string;
  date?: string;
  time?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

interface BookingConfirmationProps {
  organization: Organization;
  bookingData: BookingData;
  onBack: () => void;
}

export const BookingConfirmation = ({ 
  organization, 
  bookingData, 
  onBack 
}: BookingConfirmationProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [professionalName, setProfessionalName] = useState<string>('');
  const [professionalPhone, setProfessionalPhone] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>('');
  const [servicePrice, setServicePrice] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingData.professionalId || !bookingData.serviceId) return;

      try {
        // Buscar dados da profissional
        const { data: professional } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', bookingData.professionalId)
          .single();

        // Buscar dados do serviço
        const { data: service } = await supabase
          .from('services')
          .select('name, price_cents')
          .eq('id', bookingData.serviceId)
          .single();

        if (professional) {
          setProfessionalName(professional.full_name);
          setProfessionalPhone(professional.phone || '');
        }

        if (service) {
          setServiceName(service.name);
          setServicePrice(service.price_cents);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };

    fetchBookingDetails();
  }, [bookingData.professionalId, bookingData.serviceId]);

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Gratuito';
    const price = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const generateWhatsAppMessage = () => {
    const dateFormatted = bookingData.date ? format(parseISO(bookingData.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';
    const message = `Olá ${professionalName}! 

Acabei de agendar um horário através do site de ${organization.name}:

📅 Serviço: ${serviceName}
👤 Cliente: ${bookingData.clientName}
📞 Telefone: ${bookingData.clientPhone}
📧 Email: ${bookingData.clientEmail}
📆 Data: ${dateFormatted}
🕒 Horário: ${bookingData.time}

Obrigada!`;

    return encodeURIComponent(message);
  };

  const openWhatsApp = () => {
    if (!professionalPhone) {
      toast({
        title: 'WhatsApp não disponível',
        description: 'O profissional não possui WhatsApp cadastrado.',
        variant: 'destructive'
      });
      return;
    }

    const cleanPhone = professionalPhone.replace(/\D/g, '');
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleConfirm = async () => {
    if (!bookingData.serviceId || !bookingData.professionalId || !bookingData.date || !bookingData.time) {
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = `${bookingData.date}T${bookingData.time}:00`;

      // Revalidate availability before confirming (prevent double booking)
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('scheduled_at, duration_minutes')
        .eq('professional_id', bookingData.professionalId)
        .gte('scheduled_at', `${bookingData.date}T00:00:00`)
        .lt('scheduled_at', `${bookingData.date}T23:59:59`)
        .in('status', ['scheduled', 'confirmed', 'in_progress']);

      // Get service details for duration
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', bookingData.serviceId)
        .single();

      const serviceDuration = service?.duration_minutes || 60;
      const appointmentEndTime = new Date(new Date(scheduledAt).getTime() + serviceDuration * 60000);

      // Check for conflicts
      const hasConflict = existingAppointments?.some(apt => {
        const aptStart = new Date(apt.scheduled_at);
        const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 60) * 60000);
        
        // Check for overlap
        return (new Date(scheduledAt) < aptEnd && appointmentEndTime > aptStart);
      });

      if (hasConflict) {
        toast({
          title: 'Horário não disponível',
          description: 'Este horário foi reservado por outro cliente. Por favor, escolha outro horário.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .insert({
          organization_id: organization.id,
          professional_id: bookingData.professionalId,
          service_id: bookingData.serviceId,
          client_name: bookingData.clientName,
          client_email: bookingData.clientEmail,
          client_phone: bookingData.clientPhone,
          scheduled_at: scheduledAt,
          duration_minutes: serviceDuration,
          status: 'scheduled'
        });

      if (error) {
        console.error('Error creating appointment:', error);
        toast({
          title: 'Erro ao agendar',
          description: 'Ocorreu um erro ao confirmar seu agendamento. Tente novamente.',
          variant: 'destructive'
        });
      } else {
        setConfirmed(true);
        toast({
          title: 'Agendamento confirmado!',
          description: 'Seu horário foi reservado com sucesso.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#2A2621] mb-2">
            Agendamento confirmado!
          </h2>
          <p className="text-sm sm:text-base text-[#2A2621]/70">
            Você receberá um email de confirmação em breve com todos os detalhes.
          </p>
        </div>

        <Card className="p-4 text-left border-[#E8E4E0] rounded-xl shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-[#E6B800]" />
              <span className="text-sm sm:text-base text-[#2A2621]">
                {serviceName} {servicePrice > 0 && `- ${formatPrice(servicePrice)}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#E6B800]" />
              <span className="text-sm sm:text-base text-[#2A2621]">com {professionalName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#E6B800]" />
              <span className="text-sm sm:text-base text-[#2A2621]">
                {bookingData.date && format(parseISO(bookingData.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#E6B800]" />
              <span className="text-sm sm:text-base text-[#2A2621]">{bookingData.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#E6B800]" />
              <span className="text-sm sm:text-base text-[#2A2621]">{bookingData.clientName}</span>
            </div>
          </div>
        </Card>

        {professionalPhone && (
          <Button 
            onClick={openWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar mensagem para {professionalName} no WhatsApp
          </Button>
        )}

        <p className="text-sm text-[#2A2621]/60 text-center">
          Em caso de dúvidas, entre em contato conosco.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#2A2621] mb-2">
          Confirmar agendamento
        </h2>
        <p className="text-[#2A2621]/70 text-sm sm:text-base">
          Revise os dados antes de finalizar
        </p>
      </div>

      <Card className="p-4 border-[#E8E4E0] space-y-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-[#E6B800]" />
          <div>
            <p className="font-medium text-sm sm:text-base text-[#2A2621]">Serviço</p>
            <p className="text-xs sm:text-sm text-[#2A2621]/70">
              {serviceName} {servicePrice > 0 && `- ${formatPrice(servicePrice)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-[#E6B800]" />
          <div>
            <p className="font-medium text-sm sm:text-base text-[#2A2621]">Profissional</p>
            <p className="text-xs sm:text-sm text-[#2A2621]/70">{professionalName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#E6B800]" />
          <div>
            <p className="font-medium text-sm sm:text-base text-[#2A2621]">Data</p>
            <p className="text-xs sm:text-sm text-[#2A2621]/70">
              {bookingData.date && format(parseISO(bookingData.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#E6B800]" />
          <div>
            <p className="font-medium text-sm sm:text-base text-[#2A2621]">Horário</p>
            <p className="text-xs sm:text-sm text-[#2A2621]/70">{bookingData.time}</p>
          </div>
        </div>

        <div className="border-t border-[#E8E4E0] pt-4">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-[#E6B800]" />
            <span className="font-medium text-sm sm:text-base text-[#2A2621]">Seus dados</span>
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-[#2A2621]/70 ml-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{bookingData.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{bookingData.clientEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{bookingData.clientPhone}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-[#E8E4E0] text-[#8B7355] hover:bg-[#F5F2ED] rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-[#E6B800] hover:bg-[#D4A700] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );
};
