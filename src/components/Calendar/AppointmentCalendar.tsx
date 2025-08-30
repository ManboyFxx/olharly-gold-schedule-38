import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import AppointmentForm from './AppointmentForm';
import { AppointmentStatusManager } from './AppointmentStatusManager';

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  services?: {
    name: string;
    color: string;
  };
}

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const { currentUser } = useCurrentUser();
  const isMobile = useIsMobile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);

  useEffect(() => {
    if (user && currentUser) {
      fetchAppointments();
    }
  }, [user, currentUser, selectedDate]);

  const fetchAppointments = async () => {
    if (!currentUser) return;
    
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      let query = supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            color
          )
        `)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .order('scheduled_at');

      // Se o usuário for um profissional, filtrar apenas seus agendamentos
      if (currentUser.role === 'professional') {
        query = query.eq('professional_id', currentUser.id);
      } else {
        // Se for admin, mostrar todos os agendamentos da organização
        query = query.eq('organization_id', currentUser.organization_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar agendamentos',
          variant: 'destructive',
        });
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'scheduled':
        return 'Agendado';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'no_show':
        return 'Não Compareceu';
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Generate array of dates for horizontal scroll
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = -7; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateRange = generateDateRange();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointmentId: string) => {
    setEditingAppointment(appointmentId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAppointment(null);
    fetchAppointments(); // Refresh data
  };

  if (showForm) {
    return (
      <AppointmentForm
        onClose={handleCloseForm}
        selectedDate={selectedDate}
        appointmentId={editingAppointment || undefined}
      />
    );
  }

  if (loading) {
    return (
      <Card className="card-elegant">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", isMobile ? "px-0" : "")}>
      {/* Mobile Date Selector */}
      {isMobile ? (
        <div className="bg-card border-b border-border pb-4">
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Agenda</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewAppointment}
              className="btn-gold"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Horizontal Date Scroll */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 px-4 pb-2">
              {dateRange.map((date, index) => {
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-lg border transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card hover:bg-muted border-border",
                      isTodayDate && !isSelected && "border-primary/50"
                    )}
                  >
                    <span className="text-xs font-medium mb-1">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                    </span>
                    <span className={cn(
                      "text-lg font-bold",
                      isTodayDate && !isSelected && "text-primary"
                    )}>
                      {date.getDate()}
                    </span>
                    <span className="text-xs opacity-70">
                      {date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Header */
        <Card className="card-elegant">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Agenda do Dia</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(-1)}
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(1)}
              >
                Próximo →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Appointments List */}
      <Card className={cn("card-elegant", isMobile && "mx-4 mb-20")}>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className={cn("text-center", isMobile ? "py-8" : "py-12")}>
            <Calendar className={cn("text-muted-foreground mx-auto mb-4", isMobile ? "w-8 h-8" : "w-12 h-12")} />
            <h3 className={cn("font-medium text-foreground mb-2", isMobile ? "text-base" : "text-lg")}>
              Nenhum agendamento
            </h3>
            <p className={cn("text-muted-foreground mb-4", isMobile ? "text-sm" : "text-base")}>
              Não há agendamentos para este dia.
            </p>
            {!isMobile && (
              <Button className="btn-gold" onClick={handleNewAppointment}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            )}
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={cn(
                "bg-card rounded-lg border hover:shadow-medium transition-all duration-200",
                isMobile 
                  ? "p-4 space-y-3" 
                  : "flex items-center justify-between p-4"
              )}
            >
              {isMobile ? (
                /* Mobile Layout */
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                        <Clock className="w-4 h-4 text-primary mb-1" />
                        <span className="text-sm font-bold text-primary">
                          {formatTime(appointment.scheduled_at)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-base mb-1">
                          {appointment.client_name || 'Cliente'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name || 'Serviço'} • {appointment.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    
                    <Badge
                      variant="outline"
                      className={cn(getStatusColor(appointment.status), "text-xs")}
                    >
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                  
                  {appointment.client_email && (
                    <p className="text-sm text-muted-foreground pl-[76px]">
                      {appointment.client_email}
                    </p>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <AppointmentStatusManager 
                      appointment={{
                        id: appointment.id,
                        client_name: appointment.client_name,
                        client_email: appointment.client_email,
                        client_phone: appointment.client_phone,
                        status: appointment.status,
                        scheduled_at: appointment.scheduled_at,
                        services: appointment.services
                      }}
                      onUpdate={fetchAppointments}
                      isMobile={isMobile}
                    />
                  </div>
                </>
              ) : (
                /* Desktop Layout */
                <>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <Clock className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-sm font-medium text-foreground">
                        {formatTime(appointment.scheduled_at)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-foreground">
                          {appointment.client_name || 'Cliente'}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getStatusColor(appointment.status)}
                        >
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{appointment.services?.name || 'Serviço'}</span>
                        <span>•</span>
                        <span>{appointment.duration_minutes} min</span>
                        {appointment.client_email && (
                          <>
                            <span>•</span>
                            <span>{appointment.client_email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <AppointmentStatusManager 
                      appointment={{
                        id: appointment.id,
                        client_name: appointment.client_name,
                        client_email: appointment.client_email,
                        client_phone: appointment.client_phone,
                        status: appointment.status,
                        scheduled_at: appointment.scheduled_at,
                        services: appointment.services
                      }}
                      onUpdate={fetchAppointments}
                    />
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

        {appointments.length > 0 && (
          <div className={cn("mt-6 pt-4 border-t border-border", isMobile && "mt-4 pt-3")}>
            {isMobile ? (
              /* Mobile Footer */
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {appointments.length} agendamentos
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {appointments.reduce((total, app) => total + app.duration_minutes, 0)} min total
                  </span>
                </div>
              </div>
            ) : (
              /* Desktop Footer */
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {appointments.length} agendamentos
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {appointments.reduce((total, app) => total + app.duration_minutes, 0)} min total
                  </span>
                </div>
                
                <Button className="btn-gold" size="sm" onClick={handleNewAppointment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppointmentCalendar;