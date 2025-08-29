
import React, { useState } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import ClientsList from '@/components/Clients/ClientsList';
import ClientForm from '@/components/Clients/ClientForm';
import ClientProfile from '@/components/Clients/ClientProfile';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Clients = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'profile'>('list');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleNewClient = () => {
    setCurrentView('form');
    setSelectedClientId(null);
  };

  const handleViewProfile = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentView('profile');
  };

  const handleEditClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedClientId(null);
  };

  return (
    <AppLayout>
      <div className={cn(
        "space-y-6",
        isMobile && "space-y-4"
      )}>
        <div className={cn(
          "flex items-center justify-between",
          isMobile && "flex-col items-start space-y-3"
        )}>
          <div className={isMobile ? "w-full" : ""}>
            <h1 className={cn(
              "font-bold text-earth-900",
              isMobile ? "text-2xl" : "text-3xl"
            )}>Gestão de Clientes</h1>
            <p className={cn(
              "text-earth-600 mt-1",
              isMobile ? "text-sm" : ""
            )}>Gerencie seus clientes e histórico de agendamentos</p>
          </div>
          {currentView === 'list' && (
            <Button 
              onClick={handleNewClient}
              className={cn(
                "bg-gold hover:bg-gold-600 text-earth-900 font-semibold shadow-soft",
                isMobile && "w-full h-12"
              )}
            >
              <Plus className={cn(
                "mr-2",
                isMobile ? "w-5 h-5" : "w-4 h-4"
              )} />
              {isMobile ? "Adicionar Cliente" : "Novo Cliente"}
            </Button>
          )}
        </div>

        {currentView === 'list' && (
          <ClientsList 
            onViewProfile={handleViewProfile}
            onEditClient={handleEditClient}
          />
        )}

        {currentView === 'form' && (
          <ClientForm 
            clientId={selectedClientId}
            onBack={handleBackToList}
            onSave={handleBackToList}
          />
        )}

        {currentView === 'profile' && selectedClientId && (
          <ClientProfile 
            clientId={selectedClientId}
            onBack={handleBackToList}
            onEdit={() => handleEditClient(selectedClientId)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Clients;
