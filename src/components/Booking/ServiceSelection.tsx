import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents?: number;
}

interface ServiceSelectionProps {
  organizationId: string;
  selectedProfessionalId?: string;
  services?: Service[];
  onSelect: (serviceId: string) => void;
}

export const ServiceSelection = ({ organizationId, selectedProfessionalId, services: propServices, onSelect }: ServiceSelectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    // Se serviços foram passados como props, use-os diretamente
    if (propServices && propServices.length > 0) {
      setServices(propServices);
      setLoading(false);
      return;
    }
    const fetchServices = async () => {

      let query = supabase
        .from('services')
        .select('id, name, description, duration_minutes, price_cents')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      // Se há um profissional selecionado, filtra pelos serviços deste profissional
      if (selectedProfessionalId) {
        query = query.eq('professional_id', selectedProfessionalId);
      }

      const { data, error } = await query;

      if (data && !error) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, [organizationId, selectedProfessionalId, propServices]);

  const formatPrice = (cents: number) => {
    const price = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[#2A2621] mb-2">
            Carregando serviços...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-semibold text-[#2A2621] mb-2">
          Escolha seu serviço
        </h2>
        <p className="text-[#2A2621]/70 text-sm">
          {selectedProfessionalId 
            ? 'Serviços disponíveis com este profissional'
            : 'Selecione o serviço que deseja agendar'
          }
        </p>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`p-4 cursor-pointer transition-all duration-200 border-2 rounded-xl ${
              selectedService === service.id
                ? 'border-[#E6B800] bg-[#E6B800]/5 shadow-md'
                : 'border-[#E8E4E0] hover:border-[#E6B800]/50 hover:shadow-sm'
            }`}
            onClick={() => setSelectedService(service.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-[#2A2621] mb-1">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-[#2A2621]/70 mb-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-[#2A2621]/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  {service.price_cents && service.price_cents > 0 && (
                    <span className="font-medium text-[#E6B800]">
                      {formatPrice(service.price_cents)}
                    </span>
                  )}
                </div>
              </div>
              {selectedService === service.id && (
                <div className="ml-2">
                  <div className="w-6 h-6 bg-[#E6B800] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedService && (
        <Button
          onClick={() => onSelect(selectedService)}
          className="w-full bg-[#E6B800] hover:bg-[#E6B800]/90 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};
