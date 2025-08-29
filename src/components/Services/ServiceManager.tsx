import React, { useState } from 'react';
import { Plus, Clock, DollarSign, Edit, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDomainInfo } from '@/lib/domain';
import { useServices } from '@/hooks/useServices';
import { useOrganization } from '@/hooks/useOrganization';
import ServiceForm from './ServiceForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ServiceManager = () => {
  const { services, loading, deleteService } = useServices();
  const { organization } = useOrganization();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Gratuito';
    const price = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleEdit = (serviceId: string) => {
    setEditingService(serviceId);
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteService(serviceId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const viewInPublicBooking = () => {
    if (organization?.slug) {
      const domainInfo = getDomainInfo();
      const url = `${domainInfo.baseUrl}/${organization.slug}`;
      window.open(url, '_blank');
    }
  };

  if (showForm) {
    return (
      <ServiceForm 
        serviceId={editingService} 
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className={cn(
      isMobile ? "space-y-4 px-4" : "space-y-6"
    )}>
      <div className={cn(
        "flex justify-between",
        isMobile ? "flex-col space-y-4" : "items-center"
      )}>
        <div>
          <h2 className={cn(
            "font-bold text-foreground",
            isMobile ? "text-xl" : "text-2xl"
          )}>Serviços</h2>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-sm" : "text-base"
          )}>Gerencie os serviços oferecidos</p>
          {organization?.slug && (
            <p className={cn(
              "text-muted-foreground mt-1",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Booking público: 
              <button 
                onClick={viewInPublicBooking}
                className="text-primary hover:underline ml-1 inline-flex items-center"
              >
                {isMobile ? organization.slug : `${getDomainInfo().hostname}/${organization.slug}`}
                <ExternalLink className={cn(
                  "ml-1",
                  isMobile ? "w-3 h-3" : "w-3 h-3"
                )} />
              </button>
            </p>
          )}
        </div>
        <div className={cn(
          "flex",
          isMobile ? "flex-col space-y-2 w-full" : "space-x-2"
        )}>
          {organization?.slug && (
            <Button 
              variant="outline" 
              onClick={viewInPublicBooking}
              className={cn(
                isMobile && "w-full text-sm h-10"
              )}
            >
              <ExternalLink className={cn(
                "mr-2",
                isMobile ? "w-4 h-4" : "w-4 h-4"
              )} />
              {isMobile ? "Ver Público" : "Ver Booking Público"}
            </Button>
          )}
          <Button 
            onClick={() => setShowForm(true)} 
            className={cn(
              "btn-gold",
              isMobile && "w-full text-sm h-10"
            )}
          >
            <Plus className={cn(
              "mr-2",
              isMobile ? "w-4 h-4" : "w-4 h-4"
            )} />
            {isMobile ? "Novo" : "Novo Serviço"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className={cn(
              "animate-pulse",
              isMobile ? "p-4" : "p-6"
            )}>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className={cn(
          "text-center",
          isMobile ? "p-8" : "p-12"
        )}>
          <div className={cn(
            "bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4",
            isMobile ? "w-12 h-12" : "w-16 h-16"
          )}>
            <Plus className={cn(
              "text-primary",
              isMobile ? "w-6 h-6" : "w-8 h-8"
            )} />
          </div>
          <h3 className={cn(
            "font-semibold text-foreground mb-2",
            isMobile ? "text-base" : "text-lg"
          )}>
            Nenhum serviço cadastrado
          </h3>
          <p className={cn(
            "text-muted-foreground mb-6",
            isMobile ? "text-sm" : "text-base"
          )}>
            Comece criando seu primeiro serviço para receber agendamentos
          </p>
          <Button 
            onClick={() => setShowForm(true)} 
            className={cn(
              "btn-gold",
              isMobile && "w-full text-sm h-10"
            )}
          >
            <Plus className={cn(
              "mr-2",
              isMobile ? "w-4 h-4" : "w-4 h-4"
            )} />
            {isMobile ? "Criar Serviço" : "Criar Primeiro Serviço"}
          </Button>
        </Card>
      ) : (
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {services.map((service) => (
            <Card key={service.id} className={cn(
              "card-elegant group hover:shadow-lg transition-shadow",
              isMobile ? "p-4" : "p-6"
            )}>
              <div className={cn(
                "flex items-start justify-between",
                isMobile ? "mb-3" : "mb-4"
              )}>
                <div className="flex-1">
                  <div className={cn(
                    "flex items-center space-x-2",
                    isMobile ? "mb-1" : "mb-2"
                  )}>
                    <div 
                      className={cn(
                        "rounded-full",
                        isMobile ? "w-2 h-2" : "w-3 h-3"
                      )}
                      style={{ backgroundColor: service.color }}
                    />
                    <h3 className={cn(
                      "font-semibold text-foreground",
                      isMobile ? "text-sm" : "text-base"
                    )}>{service.name}</h3>
                  </div>
                  {service.description && (
                    <p className={cn(
                      "text-muted-foreground",
                      isMobile ? "text-xs mb-2" : "text-sm mb-3"
                    )}>
                      {service.description}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={service.is_active ? "default" : "secondary"}
                  className={cn(
                    isMobile && "text-xs px-2 py-1"
                  )}
                >
                  {service.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className={cn(
                "space-y-2",
                isMobile ? "mb-3" : "mb-4"
              )}>
                <div className={cn(
                  "flex items-center text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Clock className={cn(
                    "mr-2",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  <span>{service.duration_minutes} minutos</span>
                </div>
                <div className={cn(
                  "flex items-center text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <DollarSign className={cn(
                    "mr-2",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  <span>{formatPrice(service.price_cents)}</span>
                </div>
                {service.users?.full_name && (
                  <div className={cn(
                    "flex items-center text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
                    <Eye className={cn(
                      "mr-2",
                      isMobile ? "w-3 h-3" : "w-4 h-4"
                    )} />
                    <span>{service.users.full_name}</span>
                  </div>
                )}
              </div>

              <div className={cn(
                "flex transition-opacity",
                isMobile ? "space-x-2 opacity-100" : "space-x-2 opacity-0 group-hover:opacity-100"
              )}>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => handleEdit(service.id)}
                  className={cn(
                    "flex-1",
                    isMobile && "text-xs h-8"
                  )}
                >
                  <Edit className={cn(
                    "mr-1",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => handleDelete(service.id)}
                  className={cn(
                    "text-red-600 hover:text-red-700 hover:bg-red-50",
                    isMobile && "text-xs h-8 px-2"
                  )}
                >
                  <Trash2 className={cn(
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceManager;