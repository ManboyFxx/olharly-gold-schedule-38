
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import StatsCard from '@/components/Dashboard/StatsCard';
import QuickActions from '@/components/Dashboard/QuickActions';
import RecentBookings from '@/components/Dashboard/RecentBookings';

import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <DashboardLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-6 px-4" : "space-y-8"
      )}>
        {/* Welcome Section */}
        <div>
          <h1 className={cn(
            "font-bold text-foreground",
            isMobile ? "text-2xl" : "text-display-lg"
          )}>
            Bem-vindo ao seu painel
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-base" : "text-lg"
          )}>
            {organization?.name || 'Seu negócio'} - Gerencie seus agendamentos e clientes
          </p>
        </div>

        {/* Stats Cards */}
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
        )}>
          <StatsCard
            title="Agendamentos Hoje"
            value="12"
            icon={Calendar}
            change="+20% vs ontem"
            changeType="positive"
          />
          <StatsCard
            title="Clientes Ativos"
            value="248"
            icon={Users}
            change="+5 novos esta semana"
            changeType="positive"
          />
          <StatsCard
            title="Horas Ocupadas"
            value="6.5h"
            icon={Clock}
            change="81% da capacidade"
            changeType="neutral"
          />
          <StatsCard
            title="Receita Mensal"
            value="R$ 8.450"
            icon={TrendingUp}
            change="+12% vs mês anterior"
            changeType="positive"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Bookings - Full Width */}
        <RecentBookings />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
