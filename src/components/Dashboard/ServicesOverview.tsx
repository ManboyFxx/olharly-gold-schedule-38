import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, TrendingUp, Eye } from 'lucide-react';
import { getDomainInfo } from '@/lib/domain';
import { useServices } from '@/hooks/useServices';
import { useOrganization } from '@/hooks/useOrganization';
import { useNavigate } from 'react-router-dom';

const ServicesOverview = () => {
  const { services } = useServices();
  const { organization } = useOrganization();
  const navigate = useNavigate();

  const activeServices = services.filter(s => s.is_active);
  const totalServices = services.length;

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Gratuito';
    const price = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const viewPublicBooking = () => {
    if (organization?.slug) {
      const domainInfo = getDomainInfo();
      const url = `${domainInfo.baseUrl}/${organization.slug}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="card-elegant">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Serviços</h3>
            <p className="text-sm text-muted-foreground">
              {activeServices.length} de {totalServices} ativos
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {organization?.slug && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={viewPublicBooking}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver Público
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={() => navigate('/services')}
            className="btn-gold"
          >
            <Plus className="w-4 h-4 mr-1" />
            Gerenciar
          </Button>
        </div>
      </div>

      {activeServices.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-2">Nenhum serviço ativo</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Crie seu primeiro serviço para começar a receber agendamentos
          </p>
          <Button onClick={() => navigate('/services')} className="btn-gold">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Serviço
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeServices.slice(0, 3).map((service) => (
            <div 
              key={service.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    {service.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {service.duration_minutes}min • {formatPrice(service.price_cents)}
                  </p>
                </div>
              </div>
              {service.requires_approval && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Requer aprovação
                </div>
              )}
            </div>
          ))}
          
          {activeServices.length > 3 && (
            <div className="text-center pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/services')}
              >
                Ver mais {activeServices.length - 3} serviços
              </Button>
            </div>
          )}
        </div>
      )}

      {organization?.slug && activeServices.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Booking público ativo em:
            </div>
            <button 
              onClick={viewPublicBooking}
              className="text-primary hover:underline font-mono text-xs"
            >
              {getDomainInfo().hostname}/{organization.slug}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ServicesOverview;