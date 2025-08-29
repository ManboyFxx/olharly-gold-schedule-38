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
import AppLayout from '@/components/Layout/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();
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
    <AppLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-4" : "space-y-6"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between",
          isMobile && "flex-col gap-4 items-start"
        )}>
          <div>
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl" : "text-3xl"
            )}>Meus Agendamentos</h1>
            <p className={cn(
              "text-muted-foreground",
              isMobile ? "text-sm" : "text-base"
            )}>
              Olá, {profile?.full_name || 'Profissional'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className={cn(
              isMobile && "w-full"
            )}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
        )}>
          {/* Calendar */}
          <div className={cn(
            isMobile ? "" : "lg:col-span-2"
          )}>
            <Card>
              <CardHeader className={cn(
                isMobile && "pb-4"
              )}>
                <CardTitle className={cn(
                  isMobile ? "text-lg" : "text-xl"
                )}>Calendário</CardTitle>
              </CardHeader>
              <CardContent className={cn(
                isMobile && "px-4 pb-4"
              )}>
                <div style={{ height: isMobile ? '400px' : '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={appointments}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    views={isMobile ? ['day', 'week'] : ['month', 'week', 'day']}
                    defaultView={isMobile ? 'day' : 'week'}
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
              <CardHeader className={cn(
                isMobile && "pb-4"
              )}>
                <CardTitle className={cn(
                  isMobile ? "text-lg" : "text-xl"
                )}>Detalhes do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className={cn(
                isMobile && "px-4 pb-4"
              )}>
                {selectedAppointment ? (
                  <div className={cn(
                    isMobile ? "space-y-3" : "space-y-4"
                  )}>
                    <div>
                      <Badge className={cn(
                        getStatusColor(selectedAppointment.status),
                        isMobile && "text-xs px-2 py-1"
                      )}>
                        {getStatusText(selectedAppointment.status)}
                      </Badge>
                    </div>
                    
                    <div className={cn(
                      isMobile ? "space-y-2" : "space-y-3"
                    )}>
                      <div className="flex items-center gap-2">
                        <User className={cn(
                          "text-muted-foreground",
                          isMobile ? "w-3 h-3" : "w-4 h-4"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isMobile ? "text-sm" : "text-base"
                        )}>{selectedAppointment.client_name}</span>
                      </div>
                      
                      {selectedAppointment.client_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className={cn(
                            "text-muted-foreground",
                            isMobile ? "w-3 h-3" : "w-4 h-4"
                          )} />
                          <span className={cn(
                            isMobile ? "text-sm" : "text-base"
                          )}>{selectedAppointment.client_phone}</span>
                        </div>
                      )}
                      
                      {selectedAppointment.client_email && (
                        <div className="flex items-center gap-2">
                          <Mail className={cn(
                            "text-muted-foreground",
                            isMobile ? "w-3 h-3" : "w-4 h-4"
                          )} />
                          <span className={cn(
                            isMobile ? "text-sm" : "text-base"
                          )}>{selectedAppointment.client_email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className={cn(
                          "text-muted-foreground",
                          isMobile ? "w-3 h-3" : "w-4 h-4"
                        )} />
                        <span className={cn(
                          isMobile ? "text-sm" : "text-base"
                        )}>
                          {moment(selectedAppointment.start).format('DD/MM/YYYY HH:mm')} - 
                          {moment(selectedAppointment.end).format('HH:mm')}
                        </span>
                      </div>
                      
                      <div>
                        <p className={cn(
                          "font-medium mb-1",
                          isMobile ? "text-sm" : "text-base"
                        )}>Serviço:</p>
                        <p className={cn(
                          "text-muted-foreground",
                          isMobile ? "text-sm" : "text-base"
                        )}>{selectedAppointment.service_name}</p>
                      </div>
                      
                      {selectedAppointment.notes && (
                        <div>
                          <p className={cn(
                            "font-medium mb-1",
                            isMobile ? "text-sm" : "text-base"
                          )}>Observações:</p>
                          <p className={cn(
                            "text-muted-foreground",
                            isMobile ? "text-sm" : "text-base"
                          )}>{selectedAppointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className={cn(
                    "text-muted-foreground text-center",
                    isMobile ? "py-6 text-sm" : "py-8"
                  )}>
                    Selecione um agendamento no calendário para ver os detalhes
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className={cn(
              isMobile ? "mt-4" : "mt-6"
            )}>
              <CardHeader className={cn(
                isMobile && "pb-4"
              )}>
                <CardTitle className={cn(
                  isMobile ? "text-lg" : "text-xl"
                )}>Resumo</CardTitle>
              </CardHeader>
              <CardContent className={cn(
                isMobile && "px-4 pb-4"
              )}>
                <div className={cn(
                  isMobile ? "space-y-1.5" : "space-y-2"
                )}>
                  <div className="flex justify-between">
                    <span className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Total de agendamentos:</span>
                    <span className={cn(
                      "font-medium",
                      isMobile ? "text-sm" : "text-base"
                    )}>{appointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Confirmados:</span>
                    <span className={cn(
                      "font-medium text-green-600",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {appointments.filter(apt => apt.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Agendados:</span>
                    <span className={cn(
                      "font-medium text-yellow-600",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {appointments.filter(apt => apt.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      isMobile ? "text-sm" : "text-base"
                    )}>Concluídos:</span>
                    <span className={cn(
                      "font-medium text-blue-600",
                      isMobile ? "text-sm" : "text-base"
                    )}>
                      {appointments.filter(apt => apt.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfessionalCalendar;