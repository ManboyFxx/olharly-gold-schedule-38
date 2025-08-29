import React, { useState } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import ServiceManager from '@/components/Services/ServiceManager';
import PublicServicesDisplay from '@/components/Services/PublicServicesDisplay';
import { Briefcase, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Services = () => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-4" : "space-y-8"
      )}>
        {/* Header */}
        <div>
          <h1 className={cn(
            "font-bold text-foreground mb-2 flex items-center",
            isMobile ? "text-2xl" : "text-display-md"
          )}>
            <Briefcase className={cn(
              "mr-3 text-primary",
              isMobile ? "w-6 h-6" : "w-8 h-8"
            )} />
            Serviços
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-base" : "text-lg"
          )}>
            Gerencie seus serviços e visualize como aparecem no booking público.
          </p>
        </div>

        {/* Services Tabs */}
        <Tabs defaultValue="manage" className={cn(
          isMobile ? "space-y-4" : "space-y-6"
        )}>
          <TabsList className={cn(
            "grid w-full grid-cols-2",
            isMobile && "h-12"
          )}>
            <TabsTrigger value="manage" className={cn(
              "flex items-center space-x-2",
              isMobile && "text-sm px-2"
            )}>
              <Briefcase className={cn(
                isMobile ? "w-4 h-4" : "w-4 h-4"
              )} />
              <span>{isMobile ? "Gerenciar" : "Gerenciar Serviços"}</span>
            </TabsTrigger>
            <TabsTrigger value="public" className={cn(
              "flex items-center space-x-2",
              isMobile && "text-sm px-2"
            )}>
              <Globe className={cn(
                isMobile ? "w-4 h-4" : "w-4 h-4"
              )} />
              <span>{isMobile ? "Público" : "Visualização Pública"}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <ServiceManager />
          </TabsContent>

          <TabsContent value="public">
            <PublicServicesDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Services;