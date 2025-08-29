
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from '@/hooks/use-toast';

interface ClientAppointmentHistoryProps {
  clientId: string;
}

interface AppointmentHistory {
  id: string;
  date: string;
  time: string;
  service: string;
  professional: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  price?: number;
  rating?: number;
  notes?: string;
}

const ClientAppointmentHistory: React.FC<ClientAppointmentHistoryProps> = ({ clientId }) => {
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
    }
  }, [clientId, currentUser]);

  const loadAppointments = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          notes,
          client_notes,
          services (
            name,
            price_cents
          ),
          users!professional_id (
            full_name
          )
        `)
        .eq('organization_id', currentUser.organization_id)
        .or(`client_email.eq.${clientId},client_name.eq.${clientId}`)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar histórico de agendamentos',
          variant: 'destructive',
        });
        return;
      }

      const formattedAppointments: AppointmentHistory[] = data?.map(appointment => {
        const scheduledDate = new Date(appointment.scheduled_at);
        return {
          id: appointment.id,
          date: scheduledDate.toLocaleDateString('pt-BR'),
          time: scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          service: appointment.services?.name || 'Serviço não especificado',
          professional: appointment.users?.full_name || 'Profissional não especificado',
          status: appointment.status,
          price: appointment.services?.price_cents ? appointment.services.price_cents / 100 : 0,
          notes: appointment.notes || appointment.client_notes
        };
      }) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'scheduled':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'scheduled': 'Agendado',
      'no_show': 'Faltou'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'no_show': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Não avaliado</span>;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const totalSpent = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + apt.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Total de Agendamentos</p>
                <p className="text-2xl font-bold text-earth-900">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Total Gasto</p>
                <p className="text-xl font-bold text-earth-900">{formatCurrency(totalSpent)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-sand-200 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'completed', label: 'Concluídos' },
              { value: 'scheduled', label: 'Agendados' },
              { value: 'cancelled', label: 'Cancelados' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={filter === option.value 
                  ? "bg-gold hover:bg-gold-600 text-earth-900" 
                  : "border-sand-300 text-earth-700 hover:bg-sand-50"
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="border-sand-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-earth-900">
            Histórico de Agendamentos ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-sand-200 rounded-lg p-4 hover:bg-sand-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <h4 className="font-semibold text-earth-900">{appointment.service}</h4>
                      <div className="flex items-center space-x-4 text-sm text-earth-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(appointment.date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {appointment.professional}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                    {appointment.price > 0 && (
                      <p className="text-sm font-semibold text-earth-900 mt-1">
                        {formatCurrency(appointment.price)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-earth-500">Avaliação: </span>
                      {renderStars(appointment.rating)}
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-3 p-3 bg-sand-50 rounded text-sm text-earth-700">
                    <strong>Observações:</strong> {appointment.notes}
                  </div>
                )}
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                <p className="text-earth-500">Nenhum agendamento encontrado para este filtro.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAppointmentHistory;
