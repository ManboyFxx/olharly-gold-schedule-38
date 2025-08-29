import { useState } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeEditor from '@/components/ThemeEditor/ThemeEditor';
import NotificationSettings from '@/components/Notifications/NotificationSettings';
import CustomDomainForm from '@/components/CustomDomain/CustomDomainForm';
import UserManagement from '@/components/UserManagement/UserManagement';

import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useIsMobile } from '@/hooks/use-mobile';
import { Settings2, Palette, Users, Bell, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('general');
  const isMobile = useIsMobile();

  if (!user || !organization) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </DashboardLayout>
    );
  }

  const canManageUsers = user && ['super_admin', 'organization_admin'].includes(user.role || '');

  const handleSlugUpdate = (slug: string) => {
    // Handle slug update - could trigger organization refetch or update local state
    if (process.env.NODE_ENV === 'development') {
      console.log('Organization slug updated:', slug);
    }
  };

  return (
    <DashboardLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-4 px-4" : "space-y-8"
      )}>
        {/* Header */}
        <div>
          <h1 className={cn(
            "font-bold text-foreground mb-2 flex items-center",
            isMobile ? "text-2xl" : "text-display-md"
          )}>
            <Settings2 className={cn(
              "mr-3 text-primary",
              isMobile ? "w-6 h-6" : "w-8 h-8"
            )} />
            Configurações
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-base" : "text-lg"
          )}>
            Gerencie as configurações da sua organização e personalize a experiência
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn(
          isMobile ? "space-y-4" : "space-y-6"
        )}>
          <TabsList className={cn(
            "grid w-full",
            isMobile ? "grid-cols-2 h-12" : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          )}>
            <TabsTrigger value="general" className={cn(
              "flex items-center gap-2",
              isMobile && "text-sm px-2"
            )}>
              <Settings2 className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "hidden sm:inline"}>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className={cn(
              "flex items-center gap-2",
              isMobile && "text-sm px-2"
            )}>
              <Palette className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "hidden sm:inline"}>Tema</span>
            </TabsTrigger>
            <TabsTrigger value="domain" className={cn(
              "flex items-center gap-2",
              isMobile && "text-sm px-2"
            )}>
              <Globe className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "hidden sm:inline"}>Domínio</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className={cn(
              "flex items-center gap-2",
              isMobile && "text-sm px-2"
            )}>
              <Bell className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "hidden sm:inline"}>Notificações</span>
            </TabsTrigger>
            {canManageUsers && (
              <TabsTrigger value="users" className={cn(
                "flex items-center gap-2",
                isMobile && "text-sm px-2"
              )}>
                <Users className="h-4 w-4" />
                <span className={isMobile ? "hidden" : "hidden sm:inline"}>Usuários</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas da organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Nome da Organização</h3>
                    <p className="text-sm text-muted-foreground">{organization.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Slug</h3>
                    <p className="text-sm text-muted-foreground">{organization.slug}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <p className="text-sm text-muted-foreground capitalize">{organization.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="theme">
            <ThemeEditor />
          </TabsContent>

          <TabsContent value="domain">
            <CustomDomainForm 
              currentSlug={organization.slug || ''}
              onSlugUpdate={handleSlugUpdate}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          {canManageUsers && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;