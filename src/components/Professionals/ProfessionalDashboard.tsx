
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Concluído', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  no_show: { label: 'Não Compareceu', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

export const ProfessionalDashboard = () => {
  const { appointments, loading } = useAppointments();
  const { currentUser } = useCurrentUser();

  // Filtrar apenas os agendamentos do profissional atual
  const myAppointments = appointments.filter(
    apt => apt.professional_id === currentUser?.id
  );

  // Estatísticas do profissional
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppointments = myAppointments.filter(
    apt => new Date(apt.scheduled_at).toDateString() === today.toDateString()
  );

  const upcomingAppointments = myAppointments
    .filter(apt => new Date(apt.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  const completedThisMonth = myAppointments.filter(
    apt => {
      const aptDate = new Date(apt.scheduled_at);
      return aptDate.getMonth() === today.getMonth() && 
             aptDate.getFullYear() === today.getFullYear() &&
             apt.status === 'completed';
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Profissional */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Meus Agendamentos
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo(a), {currentUser?.full_name}! Aqui estão seus agendamentos.
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              agendamentos para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">
              atendimentos concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              agendamentos futuros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
          <CardDescription>
            Seus próximos {upcomingAppointments.length} agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento próximo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Novos agendamentos aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const config = statusConfig[appointment.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                const appointmentDate = new Date(appointment.scheduled_at);
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{appointment.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name || 'Serviço'}
                        </p>
                        {appointment.client_phone && (
                          <p className="text-xs text-muted-foreground">
                            {appointment.client_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointmentDate.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(appointmentDate, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{config.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Profissional */}
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Informações do seu perfil profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Nome:</span> {currentUser?.full_name}
            </div>
            {currentUser?.title && (
              <div>
                <span className="font-medium">Título:</span> {currentUser.title}
              </div>
            )}
            <div>
              <span className="font-medium">Email:</span> {currentUser?.email}
            </div>
            {currentUser?.phone && (
              <div>
                <span className="font-medium">Telefone:</span> {currentUser.phone}
              </div>
            )}
            <div className="flex items-center gap-2 mt-4">
              <Badge variant={currentUser?.accept_online_booking ? "default" : "secondary"}>
                {currentUser?.accept_online_booking ? "Aceita agendamentos online" : "Não aceita agendamentos online"}
              </Badge>
              <Badge variant={currentUser?.public_profile_enabled ? "default" : "secondary"}>
                {currentUser?.public_profile_enabled ? "Perfil público ativo" : "Perfil público inativo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
