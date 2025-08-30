
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';

interface Professional {
  id: string;
  full_name: string;
  display_name?: string;
  title?: string;
  avatar_url?: string;
  bio?: string;
}

interface ProfessionalSelectionProps {
  organizationId: string;
  serviceId: string;
  onSelect: (professionalId: string) => void;
  onBack: () => void;
}

export const ProfessionalSelection = ({ 
  organizationId, 
  serviceId,
  onSelect, 
  onBack 
}: ProfessionalSelectionProps) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, title, avatar_url, bio')
        .eq('organization_id', organizationId)
        .in('role', ['professional', 'organization_admin'])
        .eq('is_active', true)
        .eq('accept_online_booking', true);

      if (data && !error) {
        setProfessionals(data);
        // Não auto-selecionar mais, sempre mostrar opções
      }
      setLoading(false);
    };

    fetchProfessionals();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[#2A2621] mb-2">
            Carregando profissionais...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-semibold text-[#2A2621] mb-2">
          Escolha o profissional
        </h2>
        <p className="text-[#2A2621]/70 text-sm">
          Selecione quem realizará seu atendimento
        </p>
      </div>

      <div className="space-y-3">
        {professionals.map((professional) => (
          <Card
            key={professional.id}
            className={`p-4 cursor-pointer transition-all duration-200 border-2 rounded-xl ${
              selectedProfessional === professional.id
                ? 'border-[#E6B800] bg-[#E6B800]/5 shadow-md'
                : 'border-[#E8E4E0] hover:border-[#E6B800]/50 hover:shadow-sm'
            }`}
            onClick={() => setSelectedProfessional(professional.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E8E4E0] rounded-full flex items-center justify-center overflow-hidden">
                {professional.avatar_url ? (
                  <img
                    src={professional.avatar_url}
                    alt={professional.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#2A2621]/50" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#2A2621] mb-1">
                  {professional.full_name}
                </h3>
                {professional.title && (
                  <p className="text-sm text-[#2A2621]/70 mb-1">
                    {professional.title}
                  </p>
                )}
                {professional.bio && (
                  <p className="text-xs text-[#2A2621]/60 line-clamp-2">
                    {professional.bio}
                  </p>
                )}
              </div>
              {selectedProfessional === professional.id && (
                <div className="w-6 h-6 bg-[#E6B800] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 border-[#E8E4E0] text-[#2A2621] hover:bg-[#E8E4E0]/50 rounded-xl transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        {selectedProfessional && (
          <Button
            onClick={() => onSelect(selectedProfessional)}
            className="flex-1 bg-[#E6B800] hover:bg-[#E6B800]/90 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
