import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, Clock, User, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  service_name: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

const ProfessionalCalendar: React.FC = () => {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchAppointments();
    }
  }, [profile]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          notes,
          client_name,
          client_phone,
          client_email,
          services (name)
        `)
        .eq('professional_id', profile?.id)
        .gte('scheduled_at', moment().startOf('month').toISOString())
        .lte('scheduled_at', moment().endOf('month').add(1, 'month').toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar agendamentos',
          variant: 'destructive',
        });
        return;
      }

      const formattedAppointments: Appointment[] = data.map((apt: any) => {
        const startTime = new Date(apt.scheduled_at);
        const endTime = new Date(startTime.getTime() + (apt.duration_minutes * 60000));
        
        return {
          id: apt.id,
          title: `${apt.client_name} - ${apt.services?.name || 'Serviço'}`,
          start: startTime,
          end: endTime,
          client_name: apt.client_name,
          client_phone: apt.client_phone,
          client_email: apt.client_email,
          service_name: apt.services?.name || 'Serviço',
          status: apt.status,
          notes: apt.notes,
        };
      });

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Appointment) => {
    setSelectedAppointment(event);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-scale-in">
          <div className="w-8 h-8 bg-primary rounded-lg mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
              <p className="text-muted-foreground">
                Olá, {profile?.full_name || 'Profissional'}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={appointments}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    views={['month', 'week', 'day']}
                    defaultView="week"
                    messages={{
                      next: 'Próximo',
                      previous: 'Anterior',
                      today: 'Hoje',
                      month: 'Mês',
                      week: 'Semana',
                      day: 'Dia',
                      agenda: 'Agenda',
                      date: 'Data',
                      time: 'Hora',
                      event: 'Evento',
                      noEventsInRange: 'Nenhum agendamento neste período',
                    }}
                    formats={{
                      timeGutterFormat: 'HH:mm',
                      eventTimeRangeFormat: ({ start, end }) =>
                        `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Agendamento</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAppointment ? (
                  <div className="space-y-4">
                    <div>
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {getStatusText(selectedAppointment.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{selectedAppointment.client_name}</span>
                      </div>
                      
                      {selectedAppointment.client_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedAppointment.client_phone}</span>
                        </div>
                      )}
                      
                      {selectedAppointment.client_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedAppointment.client_email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {moment(selectedAppointment.start).format('DD/MM/YYYY HH:mm')} - 
                          {moment(selectedAppointment.end).format('HH:mm')}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-1">Serviço:</p>
                        <p className="text-muted-foreground">{selectedAppointment.service_name}</p>
                      </div>
                      
                      {selectedAppointment.notes && (
                        <div>
                          <p className="font-medium mb-1">Observações:</p>
                          <p className="text-muted-foreground">{selectedAppointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Selecione um agendamento no calendário para ver os detalhes
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de agendamentos:</span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confirmados:</span>
                    <span className="font-medium text-green-600">
                      {appointments.filter(apt => apt.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agendados:</span>
                    <span className="font-medium text-yellow-600">
                      {appointments.filter(apt => apt.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Concluídos:</span>
                    <span className="font-medium text-blue-600">
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCalendar;