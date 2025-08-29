
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, Settings, Users, Palette, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/PermissionGate';
import ResponsiveHeader from '@/components/Layout/ResponsiveHeader';

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
      id: 'dashboard',
      label: 'Dashboard',
      icon: Calendar,
      description: 'Visão geral dos agendamentos',
      component: <ProfessionalDashboard />
    },
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
    <>
      <ResponsiveHeader />
      <div className={cn(
        "space-y-6",
        isMobile && "px-4"
      )}>
      {/* Header */}
      <div className={cn(
        "space-y-3",
        isMobile ? "px-1" : "px-0"
      )}>
        <h1 className={cn(
          "font-bold text-foreground flex items-center",
          isMobile ? "text-xl mb-1" : "text-display-md mb-2"
        )}>
          <Calendar className={cn(
            "text-primary flex-shrink-0",
            isMobile ? "w-5 h-5 mr-2" : "w-8 h-8 mr-3"
          )} />
          <span className={cn(
            isMobile && "truncate"
          )}>
            {headerTitle}
          </span>
        </h1>
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          isMobile ? "text-sm" : "text-lg"
        )}>
          {headerDescription}
        </p>
        
        {/* Indicador de Role */}
        <div className={cn(
          "flex items-center",
          isMobile ? "justify-start" : "justify-start"
        )}>
          <span className={cn(
            "inline-flex items-center rounded-full font-medium",
            isMobile ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
            isOwner 
              ? "bg-gold-100 text-gold-800" 
              : "bg-blue-100 text-blue-800"
          )}>
            {isOwner ? '👑 Proprietário' : '👤 Profissional'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className={cn(
        isMobile ? "space-y-3" : "space-y-6"
      )}>
        <TabsList className={cn(
          "grid w-full bg-muted/50",
          tabs.length === 4 ? "grid-cols-4" : tabs.length === 5 ? "grid-cols-5" : "grid-cols-3",
          isMobile ? "h-auto p-1 gap-1" : "h-10 p-1"
        )}>
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={cn(
                "flex items-center justify-center transition-all duration-200",
                isMobile 
                  ? "text-xs px-1 py-2 flex-col gap-1 min-h-[3rem] rounded-md" 
                  : "text-sm px-3 py-2 gap-1.5 rounded-md",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm"
              )}
            >
              <tab.icon className={cn(
                "flex-shrink-0",
                isMobile ? "w-4 h-4" : "w-4 h-4"
              )} />
              <span className={cn(
                "font-medium",
                isMobile ? "text-[10px] leading-tight text-center max-w-full" : "text-sm"
              )}>
                {isMobile ? tab.label.split(' ')[0] : tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className={cn(
            isMobile ? "mt-3" : "mt-6"
          )}>
            <div className={cn(
              isMobile ? "space-y-3" : "space-y-4"
            )}>
              {!isMobile && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">{tab.label}</h2>
                  {tab.description && (
                    <p className="text-muted-foreground">{tab.description}</p>
                  )}
                </div>
              )}
              {isMobile && (
                <div className="mb-4 px-1">
                  <h2 className="text-lg font-semibold text-foreground">{tab.label}</h2>
                  {tab.description && (
                    <p className="text-sm text-muted-foreground mt-1">{tab.description}</p>
                  )}
                </div>
              )}
              <div className={cn(
                isMobile && "px-1"
              )}>
                {tab.component}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    </>
  );
};

export default MySpaceManager;
