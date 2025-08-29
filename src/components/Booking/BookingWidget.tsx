import { useState } from 'react';
import { BookingHeader } from './BookingHeader';
import { ServiceSelection } from './ServiceSelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientForm } from './ClientForm';
import { BookingConfirmation } from './BookingConfirmation';
import { BookingFooter } from './BookingFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  language: string;
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
  avatar_url?: string;
  bio?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents?: number;
  color?: string;
}

interface BookingData {
  serviceId?: string;
  professionalId?: string;
  date?: string;
  time?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

interface BookingWidgetProps {
  organization: Organization;
  selectedProfessional?: Professional;
  services?: Service[];
  availability?: any[];
}

export const BookingWidget = ({ organization, selectedProfessional, services = [], availability = [] }: BookingWidgetProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    professionalId: selectedProfessional?.id
  });
  const isMobile = useIsMobile();

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedProfessional) {
      setCurrentStep(3); // Pula direto para data/horário
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 3 && selectedProfessional) {
      setCurrentStep(1); // Volta direto para serviços
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = selectedProfessional 
    ? [
        'Escolha o Serviço',
        '', // Etapa pulada
        'Data e Horário',
        'Seus Dados',
        'Confirmação'
      ]
    : [
        'Escolha o Serviço',
        'Selecione o Profissional', 
        'Data e Horário',
        'Seus Dados',
        'Confirmação'
      ];

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!bookingData.serviceId;
      case 2: return !!bookingData.professionalId;
      case 3: return !!bookingData.date && !!bookingData.time;
      case 4: return !!bookingData.clientName && !!bookingData.clientEmail;
      default: return false;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] to-[#F8F6F3] flex flex-col">
        <BookingHeader organization={organization} selectedProfessional={selectedProfessional} />
        
        {/* Progress indicator */}
        <div className="px-4 py-3 bg-white border-b border-[#E8E4E0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2A2621]">
              Etapa {selectedProfessional ? (currentStep === 3 ? 2 : currentStep === 4 ? 3 : currentStep === 5 ? 4 : currentStep) : currentStep} de {selectedProfessional ? 4 : 5}
            </span>
            <span className="text-sm text-[#2A2621]/60">
              {Math.round(((selectedProfessional ? (currentStep === 3 ? 2 : currentStep === 4 ? 3 : currentStep === 5 ? 4 : currentStep) : currentStep) / (selectedProfessional ? 4 : 5)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#E8E4E0] rounded-full h-2">
            <div 
              className="bg-[#E6B800] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((selectedProfessional ? (currentStep === 3 ? 2 : currentStep === 4 ? 3 : currentStep === 5 ? 4 : currentStep) : currentStep) / (selectedProfessional ? 4 : 5)) * 100}%` }}
            />
          </div>
          <h2 className="text-lg font-semibold text-[#2A2621] mt-3">
            {stepTitles[currentStep - 1]}
          </h2>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            {currentStep === 1 && (
              <ProfessionalSelection
                organizationId={organization.id}
                serviceId="" // Permitir seleção sem serviço específico
                onSelect={(professionalId) => {
                  updateBookingData({ professionalId });
                  nextStep();
                }}
                onBack={() => {}} // Primeiro passo, não tem volta
              />
            )}
            
            {currentStep === 2 && (
              <ServiceSelection
                organizationId={organization.id}
                selectedProfessionalId={bookingData.professionalId}
                services={services}
                onSelect={(serviceId) => {
                  updateBookingData({ serviceId });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 3 && (
              <DateTimeSelection
                organizationId={organization.id}
                professionalId={bookingData.professionalId!}
                serviceId={bookingData.serviceId!}
                onSelect={(date, time) => {
                  updateBookingData({ date, time });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 4 && (
              <ClientForm
                onSubmit={(clientData) => {
                  updateBookingData(clientData);
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 5 && (
              <BookingConfirmation
                organization={organization}
                bookingData={bookingData}
                onBack={prevStep}
              />
            )}
          </div>
        </div>
        
        {/* Fixed bottom navigation */}
        {currentStep < 5 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4E0] p-4 safe-area-pb">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 btn-mobile-secondary"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              <Button
                onClick={nextStep}
                disabled={!canGoNext()}
                className={cn(
                  "btn-mobile",
                  currentStep === 1 ? "flex-1" : "flex-2"
                )}
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        <BookingFooter organizationSlug={organization.slug} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] to-[#F8F6F3] flex flex-col">
      <BookingHeader organization={organization} selectedProfessional={selectedProfessional} />
      
      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E8E4E0]/50 p-6 sm:p-8">
            {currentStep === 1 && (
              <ProfessionalSelection
                organizationId={organization.id}
                serviceId="" // Permitir seleção sem serviço específico
                onSelect={(professionalId) => {
                  updateBookingData({ professionalId });
                  nextStep();
                }}
                onBack={() => {}} // Primeiro passo, não tem volta
              />
            )}
            
            {currentStep === 2 && (
              <ServiceSelection
                organizationId={organization.id}
                selectedProfessionalId={bookingData.professionalId}
                services={services}
                onSelect={(serviceId) => {
                  updateBookingData({ serviceId });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 3 && (
              <DateTimeSelection
                organizationId={organization.id}
                professionalId={bookingData.professionalId!}
                serviceId={bookingData.serviceId!}
                onSelect={(date, time) => {
                  updateBookingData({ date, time });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 4 && (
              <ClientForm
                onSubmit={(clientData) => {
                  updateBookingData(clientData);
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            
            {currentStep === 5 && (
              <BookingConfirmation
                organization={organization}
                bookingData={bookingData}
                onBack={prevStep}
              />
            )}
          </div>
        </div>
      </div>
      
      <BookingFooter organizationSlug={organization.slug} />
    </div>
  );
};
