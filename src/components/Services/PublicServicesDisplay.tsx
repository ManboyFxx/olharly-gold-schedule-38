import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, BarChart, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { getDomainInfo } from '@/lib/domain';
import { useServices } from '@/hooks/useServices';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ServiceStatsProps {
  serviceId: string;
}

const ServiceStats: React.FC<ServiceStatsProps> = ({ serviceId }) => {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    totalBookings: 0,
    thisMonth: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Total bookings
      const { count: totalCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', serviceId)
        .eq('status', 'completed');

      // This month bookings
      const { count: monthCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', serviceId)
        .eq('status', 'completed')
        .gte('scheduled_at', startOfMonth.toISOString());

      // Revenue calculation (simplified)
      const { data: appointments } = await supabase
        .from('appointments')
        .select('services(price_cents)')
        .eq('service_id', serviceId)
        .eq('status', 'completed');

      const revenue = appointments?.reduce((total, apt) => {
        return total + (apt.services?.price_cents || 0);
      }, 0) || 0;

      setStats({
        totalBookings: totalCount || 0,
        thisMonth: monthCount || 0,
        revenue: revenue / 100 // Convert to reais
      });
    };

    fetchStats();
  }, [serviceId]);

  return (
    <div className={cn("grid grid-cols-3 mt-2", isMobile ? "gap-1" : "gap-2")}>
      <div className="text-center">
        <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
          Total
        </div>
        <div className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
          {stats.totalBookings}
        </div>
      </div>
      <div className="text-center">
        <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
          Este mês
        </div>
        <div className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
          {stats.thisMonth}
        </div>
      </div>
      <div className="text-center">
        <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
          Receita
        </div>
        <div className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(stats.revenue)}
        </div>
      </div>
    </div>
  );
};

const PublicServicesDisplay = () => {
  const { services } = useServices();
  const { organization } = useOrganization();
  const isMobile = useIsMobile();

  const activeServices = services.filter(s => s.is_active);

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Gratuito';
    const price = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const viewInPublicBooking = () => {
    if (organization?.slug) {
      const domainInfo = getDomainInfo();
      const url = `${domainInfo.baseUrl}/${organization.slug}`;
      window.open(url, '_blank');
    }
  };

  if (activeServices.length === 0) {
    return (
      <Card className={cn("card-elegant text-center", isMobile ? "p-4" : "p-8")}>
        <div className={cn("bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4", isMobile ? "w-12 h-12" : "w-16 h-16")}>
          <BarChart className={cn("text-primary", isMobile ? "w-6 h-6" : "w-8 h-8")} />
        </div>
        <h3 className={cn("font-semibold text-foreground mb-2", isMobile ? "text-base" : "text-lg")}>
          Nenhum serviço público ativo
        </h3>
        <p className={cn("text-muted-foreground mb-4", isMobile ? "text-sm" : "")}>
          Ative pelo menos um serviço para aparecer no seu booking público
        </p>
        {organization?.slug && (
          <Button variant="outline" onClick={viewInPublicBooking} size={isMobile ? "sm" : "default"}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Booking Público
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", isMobile && "space-y-4")}>
      <div className={cn("flex justify-between", isMobile ? "flex-col space-y-3" : "items-center")}>
        <div>
          <h3 className={cn("font-semibold text-foreground", isMobile ? "text-base" : "text-lg")}>Serviços Públicos</h3>
          <p className="text-sm text-muted-foreground">
            Serviços visíveis no seu booking público
          </p>
        </div>
        {organization?.slug && (
          <Button variant="outline" onClick={viewInPublicBooking} size={isMobile ? "sm" : "default"} className={isMobile ? "w-full" : ""}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Booking Público
          </Button>
        )}
      </div>

      <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
        {activeServices.map((service) => (
          <Card key={service.id} className={cn("card-elegant", isMobile ? "p-4" : "p-6")}>
            <div className={cn("flex items-start justify-between", isMobile ? "mb-2" : "mb-3")}>
              <div className="flex-1">
                <div className={cn("flex items-center mb-2", isMobile ? "space-x-1.5" : "space-x-2")}>
                  <div 
                    className={cn("rounded-full", isMobile ? "w-2.5 h-2.5" : "w-3 h-3")}
                    style={{ backgroundColor: service.color }}
                  />
                  <h4 className={cn("font-medium text-foreground", isMobile ? "text-sm" : "")}>{service.name}</h4>
                  <Badge variant="default" className={cn(isMobile ? "text-xs px-1.5 py-0.5" : "text-xs")}>
                    Público
                  </Badge>
                </div>
                {service.description && (
                  <p className={cn("text-muted-foreground mb-2 line-clamp-2", isMobile ? "text-xs" : "text-sm")}>
                    {service.description}
                  </p>
                )}
              </div>
            </div>

            <div className={cn("space-y-2", isMobile ? "mb-2" : "mb-3")}>
              <div className={cn("flex items-center justify-between", isMobile ? "text-xs" : "text-sm")}>
                <div className="flex items-center text-muted-foreground">
                  <Clock className={cn("mr-1", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                  <span>{service.duration_minutes} min</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className={cn("mr-1", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                  <span>{formatPrice(service.price_cents)}</span>
                </div>
              </div>
              
              {service.requires_approval && (
                <Badge variant="secondary" className={cn(isMobile ? "text-xs px-1.5 py-0.5" : "text-xs")}>
                  Requer Aprovação
                </Badge>
              )}
            </div>

            <ServiceStats serviceId={service.id} />
          </Card>
        ))}
      </div>

      {organization?.slug && (
        <div className={cn("bg-muted/50 rounded-lg border-2 border-dashed", isMobile ? "p-3" : "p-4")}>
          <div className="text-center">
            <h4 className={cn("font-medium text-foreground mb-2", isMobile ? "text-sm" : "")}>
              Booking Público Ativo
            </h4>
            <p className={cn("text-muted-foreground mb-3", isMobile ? "text-xs" : "text-sm")}>
              Seus clientes podem agendar em:
            </p>
            <code className={cn("bg-background px-3 py-2 rounded border font-mono text-primary", isMobile ? "text-xs" : "text-sm")}>
              {getDomainInfo().hostname}/{organization.slug}
            </code>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={viewInPublicBooking}
                className={isMobile ? "w-full" : ""}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicServicesDisplay;