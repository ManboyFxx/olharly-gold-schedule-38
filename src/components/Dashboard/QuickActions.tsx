
import React from 'react';
import { Plus, Calendar, Link, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/hooks/useOrganization';
import { generateBookingUrl } from '@/lib/domain';

const QuickActions = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();

  const handleShareLink = () => {
    if (organization?.slug) {
      const url = generateBookingUrl(organization.slug);
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="card-elegant">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button 
          className="btn-gold justify-start h-auto py-4 px-4"
          onClick={() => navigate('/calendar')}
        >
          <Plus className="w-5 h-5 mr-3" />
          <div className="text-left">
            <p className="font-medium">Novo Agendamento</p>
            <p className="text-xs opacity-80">Agendar para cliente</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 hover:bg-accent"
          onClick={() => navigate('/calendar')}
        >
          <Calendar className="w-5 h-5 mr-3" />
          <div className="text-left">
            <p className="font-medium">Ver Agenda</p>
            <p className="text-xs text-muted-foreground">Visualizar horários</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 hover:bg-accent"
          onClick={handleShareLink}
        >
          <Link className="w-5 h-5 mr-3" />
          <div className="text-left">
            <p className="font-medium">Compartilhar Link</p>
            <p className="text-xs text-muted-foreground">Enviar para clientes</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start h-auto py-4 px-4 hover:bg-accent"
          onClick={() => navigate('/clients')}
        >
          <Users className="w-5 h-5 mr-3" />
          <div className="text-left">
            <p className="font-medium">Gerenciar Clientes</p>
            <p className="text-xs text-muted-foreground">Cadastros e histórico</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
