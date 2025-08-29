
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, Settings, Users, Palette, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/PermissionGate';

// Import components for each tab
import ProfessionalManager from './ProfessionalManager';
import CustomizationManager from './CustomizationManager';
import ServiceManager from '../Services/ServiceManager';
import { AvailabilityManager } from './AvailabilityManager';
import { TimeOffManager } from './TimeOffManager';
import { ProfessionalDashboard } from './ProfessionalDashboard';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  component: React.ReactNode;
}

const MySpaceManager = () => {
  const { user } = useAuth();
  const { currentUser, loading } = useCurrentUser();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Faça login para acessar seu espaço.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Configurações diferentes para dona do espaço vs profissional
  const isOwner = currentUser?.role === 'organization_admin' || currentUser?.role === 'super_admin';
  const isProfessional = currentUser?.role === 'professional';

  // Tabs para dona do espaço (controle total)
  const ownerTabs: TabConfig[] = [
    {
      id: 'services',
      label: 'Serviços',
      icon: Calendar,
      description: 'Gerencie todos os serviços da organização',
      component: <ServiceManager />
    },
    {
      id: 'availability',
      label: 'Horários',
      icon: Settings,
      description: 'Configure horários de funcionamento',
      component: (
        <div className="space-y-6">
          <AvailabilityManager />
          <TimeOffManager />
        </div>
      )
    },
    {
      id: 'professionals',
      label: 'Profissionais',
      icon: Users,
      description: 'Gerencie profissionais da organização',
      component: (
        <PermissionGate 
          permission="hasMultipleUsers" 
          feature="Gerenciamento de Profissionais"
          showUpgradeModal={true}
        >
          <ProfessionalManager />
        </PermissionGate>
      )
    },
    {
      id: 'customization',
      label: 'Personalização',
      icon: Palette,
      description: 'Personalize sua agenda e espaço',
      component: <CustomizationManager />
    }
  ];

  // Tabs para profissional (apenas seus dados)
  const professionalTabs: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Meus Agendamentos',
      icon: Calendar,
      description: 'Visualize seus agendamentos',
      component: <ProfessionalDashboard />
    },
    {
      id: 'services',
      label: 'Meus Serviços',
      icon: User,
      description: 'Gerencie seus serviços',
      component: <ServiceManager />
    },
    {
      id: 'availability',
      label: 'Meus Horários',
      icon: Settings,
      description: 'Configure seus horários',
      component: (
        <div className="space-y-6">
          <AvailabilityManager />
          <TimeOffManager />
        </div>
      )
    }
  ];

  const tabs = isOwner ? ownerTabs : professionalTabs;
  const headerTitle = isOwner ? 'Meu espaço' : 'Meu painel';
  const headerDescription = isOwner 
    ? 'Configure seu perfil público e gerencie seus serviços de agendamento online'
    : 'Visualize seus agendamentos e gerencie seu perfil profissional';

  return (
    <div className={cn(
      "space-y-6",
      isMobile && "px-4"
    )}>
      {/* Header */}
      <div>
        <h1 className={cn(
          "font-bold text-foreground mb-2 flex items-center",
          isMobile ? "text-2xl" : "text-display-md"
        )}>
          <Calendar className={cn(
            "mr-3 text-primary",
            isMobile ? "w-6 h-6" : "w-8 h-8"
          )} />
          {headerTitle}
        </h1>
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-base" : "text-lg"
        )}>
          {headerDescription}
        </p>
        
        {/* Indicador de Role */}
        <div className="mt-2">
          <span className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            isOwner 
              ? "bg-gold-100 text-gold-800" 
              : "bg-blue-100 text-blue-800"
          )}>
            {isOwner ? '👑 Proprietário' : '👤 Profissional'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "grid w-full",
          isMobile ? `grid-cols-${Math.min(tabs.length, 2)} h-auto` : `grid-cols-${tabs.length}`,
          !isMobile && "h-12"
        )}>
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={cn(
                "flex items-center gap-2",
                isMobile && "flex-col py-3 px-2 h-auto"
              )}
            >
              <tab.icon className={cn(
                isMobile ? "w-4 h-4" : "w-5 h-5"
              )} />
              <span className={cn(
                isMobile ? "text-xs" : "text-sm"
              )}>
                {tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <div className="space-y-4">
              {!isMobile && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">{tab.label}</h2>
                  {tab.description && (
                    <p className="text-muted-foreground">{tab.description}</p>
                  )}
                </div>
              )}
              {tab.component}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MySpaceManager;
