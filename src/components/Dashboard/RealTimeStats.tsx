import React, { memo } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import StatsCard from './StatsCard';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';

const RealTimeStats = memo(() => {
  const { appointments } = useAppointments();
  const { clients } = useClients();

  // Calculate stats from real data
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.scheduled_at).toDateString() === new Date().toDateString()
  );
  
  const confirmedAppointments = todayAppointments.filter(apt => apt.status === 'confirmed');
  const completionRate = todayAppointments.length > 0 
    ? Math.round((confirmedAppointments.length / todayAppointments.length) * 100)
    : 0;

  const nextAppointment = appointments
    .filter(apt => new Date(apt.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];

  // Calculate weekly stats for trend analysis
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekAppointments = appointments.filter(apt => 
    new Date(apt.scheduled_at) >= startOfWeek
  );

  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduled_at);
    return aptDate >= lastWeekStart && aptDate < startOfWeek;
  });

  const weeklyGrowth = lastWeekAppointments.length > 0 
    ? Math.round(((thisWeekAppointments.length - lastWeekAppointments.length) / lastWeekAppointments.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Agendamentos Hoje"
        value={todayAppointments.length.toString()}
        change={`${confirmedAppointments.length} confirmados`}
        changeType="positive"
        icon={Calendar}
      />
      <StatsCard
        title="Clientes Ativos"
        value={clients.length.toString()}
        change={weeklyGrowth > 0 ? `+${weeklyGrowth}% esta semana` : 'Sem crescimento'}
        changeType={weeklyGrowth > 0 ? "positive" : "neutral"}
        icon={Users}
      />
      <StatsCard
        title="Taxa de Comparecimento"
        value={`${completionRate}%`}
        change="Hoje"
        changeType={completionRate >= 80 ? "positive" : "neutral"}
        icon={TrendingUp}
      />
      <StatsCard
        title="Próximo Atendimento"
        value={nextAppointment ? new Date(nextAppointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        change={nextAppointment ? nextAppointment.client_name : 'Nenhum agendado'}
        changeType="neutral"
        icon={Clock}
      />
    </div>
  );
});

RealTimeStats.displayName = 'RealTimeStats';

export default RealTimeStats;