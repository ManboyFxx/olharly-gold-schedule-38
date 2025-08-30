import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentMetrics {
  today: number;
  thisWeek: number;
  thisMonth: number;
  completionRate: number;
  totalRevenue: number;
  avgDuration: number;
  nextAppointments: Array<{
    id: string;
    client_name: string;
    scheduled_at: string;
    services: { name: string; color: string } | null;
  }>;
  statusBreakdown: {
    scheduled: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
}

const MetricsOverview = () => {
  const { currentUser } = useCurrentUser();
  const isMobile = useIsMobile();
  const [metrics, setMetrics] = useState<AppointmentMetrics>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    completionRate: 0,
    totalRevenue: 0,
    avgDuration: 0,
    nextAppointments: [],
    statusBreakdown: {
      scheduled: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchMetrics();
    }
  }, [currentUser]);

  const fetchMetrics = async () => {
    if (!currentUser) return;

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let baseQuery = supabase.from('appointments').select(`
        *,
        services (name, color, price_cents)
      `);

      // Filter by user role
      if (currentUser.role === 'professional') {
        baseQuery = baseQuery.eq('professional_id', currentUser.id);
      } else {
        baseQuery = baseQuery.eq('organization_id', currentUser.organization_id);
      }

      const { data: appointments, error } = await baseQuery;

      if (error) throw error;

      if (appointments) {
        // Today's appointments
        const today = appointments.filter(apt => 
          new Date(apt.scheduled_at) >= startOfDay &&
          new Date(apt.scheduled_at) < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
        ).length;

        // This week's appointments
        const thisWeek = appointments.filter(apt => 
          new Date(apt.scheduled_at) >= startOfWeek
        ).length;

        // This month's appointments
        const thisMonth = appointments.filter(apt => 
          new Date(apt.scheduled_at) >= startOfMonth
        ).length;

        // Completion rate
        const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
        const completionRate = appointments.length > 0 ? (completedAppointments / appointments.length) * 100 : 0;

        // Total revenue (estimated)
        const totalRevenue = appointments
          .filter(apt => apt.status === 'completed')
          .reduce((sum, apt) => sum + (apt.services?.price_cents || 0), 0) / 100;

        // Average duration
        const avgDuration = appointments.length > 0 
          ? appointments.reduce((sum, apt) => sum + apt.duration_minutes, 0) / appointments.length 
          : 0;

        // Next appointments (upcoming)
        const nextAppointments = appointments
          .filter(apt => new Date(apt.scheduled_at) > now)
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
          .slice(0, 5);

        // Status breakdown
        const statusBreakdown = {
          scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
          confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
          in_progress: appointments.filter(apt => apt.status === 'in_progress').length,
          completed: appointments.filter(apt => apt.status === 'completed').length,
          cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
          no_show: appointments.filter(apt => apt.status === 'no_show').length,
        };

        setMetrics({
          today,
          thisWeek,
          thisMonth,
          completionRate,
          totalRevenue,
          avgDuration,
          nextAppointments,
          statusBreakdown
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
      )}>
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.today}</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.thisWeek}</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown and Next Appointments */}
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {/* Status Breakdown */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Status dos Agendamentos
            </CardTitle>
            <CardDescription>Distribuição por status este mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(metrics.statusBreakdown).map(([status, count]) => {
              const statusLabels = {
                scheduled: { label: 'Agendados', color: 'bg-blue-500' },
                confirmed: { label: 'Confirmados', color: 'bg-green-500' },
                in_progress: { label: 'Em Andamento', color: 'bg-yellow-500' },
                completed: { label: 'Concluídos', color: 'bg-emerald-500' },
                cancelled: { label: 'Cancelados', color: 'bg-red-500' },
                no_show: { label: 'Não Compareceram', color: 'bg-gray-500' }
              };

              const statusInfo = statusLabels[status as keyof typeof statusLabels];
              const percentage = metrics.thisMonth > 0 ? (count / metrics.thisMonth) * 100 : 0;

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", statusInfo.color)} />
                    <span className="text-sm font-medium">{statusInfo.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{count}</span>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Next Appointments */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>Os próximos agendamentos confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.nextAppointments.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento próximo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.nextAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center bg-primary/10 rounded-lg p-2 min-w-[50px]">
                        <span className="text-xs font-medium text-primary">
                          {formatDate(appointment.scheduled_at)}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {formatTime(appointment.scheduled_at)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {appointment.client_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.services?.name || 'Serviço'}
                        </p>
                      </div>
                    </div>
                    {appointment.services?.color && (
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: appointment.services.color }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsOverview;