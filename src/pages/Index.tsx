
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import RealTimeStats from '@/components/Dashboard/RealTimeStats';
import { getDomainInfo } from '@/lib/domain';
import { useAuth } from '@/hooks/useAuth';
import QuickActions from '@/components/Dashboard/QuickActions';
import RecentBookings from '@/components/Dashboard/RecentBookings';
import ServicesOverview from '@/components/Dashboard/ServicesOverview';
import OrganizationSetup from '@/components/Onboarding/OrganizationSetup';
import LoadingState from '@/components/LoadingState';
import { useOrganization } from '@/hooks/useOrganization';
import { Calendar } from 'lucide-react';

const Index = () => {
  const { organization, loading: orgLoading } = useOrganization();

  // Show organization setup if no organization exists
  if (!orgLoading && !organization) {
    return <OrganizationSetup />;
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Carregando dashboard..." size="lg" />
      </div>
    );
  }


  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-display-md font-bold text-foreground mb-2">
            Bem-vindo ao {organization?.name || 'Olharly'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Aqui está um resumo dos seus agendamentos hoje.
          </p>
        </div>

        {/* Real-time Stats Grid */}
        <RealTimeStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-8">
            <QuickActions />
            <ServicesOverview />
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <RecentBookings />
          </div>
        </div>

        {/* White Label Info Card */}
        <div className="card-highlight">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gold-900 mb-2">
                🎨 Sistema White Label Ativo
              </h3>
              <p className="text-gold-800 mb-4">
                Seu sistema está configurado com sua identidade visual personalizada. 
                Clientes verão sua marca em todas as interações.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
                  <span className="text-sm text-gold-800">Link personalizado: <strong>{getDomainInfo().hostname}/{organization?.slug}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
                  <span className="text-sm text-gold-800">Cores da marca: Configuradas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
                  <span className="text-sm text-gold-800">Logo personalizada: Ativa</span>
                </div>
              </div>
            </div>
            <div className="w-20 h-20 bg-gold-200 rounded-lg flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gold-600" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
