
import React from 'react';
import { Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Concluído', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { label: 'Não Compareceu', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const RecentBookings = () => {
  const { appointments, loading } = useAppointments();

  // Get upcoming appointments (next 5)
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="card-elegant">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="card-elegant">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Próximos Agendamentos</h3>
        <Badge variant="secondary" className="text-xs">
          {upcomingAppointments.length} agendamentos
        </Badge>
      </div>
      
      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
              <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-warm-100 hover:bg-warm-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.services?.name || 'Serviço'}
                    </p>
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
    </div>
  );
};

export default RecentBookings;
