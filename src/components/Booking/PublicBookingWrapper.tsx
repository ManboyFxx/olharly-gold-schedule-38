import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookingWidget } from './BookingWidget';
import { BookingNotFound } from './BookingNotFound';
import { Skeleton } from '@/components/ui/skeleton';

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

interface PublicBookingWrapperProps {
  organizationSlug: string;
  professionalSlug?: string;
}

export const PublicBookingWrapper = ({ organizationSlug, professionalSlug }: PublicBookingWrapperProps) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca a organização
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url, primary_color, secondary_color, timezone, language')
          .eq('slug', organizationSlug)
          .eq('public_booking_enabled', true)
          .single();

        if (orgError || !orgData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setOrganization(orgData);
        
        // Apply custom colors to CSS variables
        document.documentElement.style.setProperty('--primary-color', orgData.primary_color);
        document.documentElement.style.setProperty('--secondary-color', orgData.secondary_color);

        // Se tem slug do profissional, busca o profissional específico
        if (professionalSlug) {
          const { data: profData, error: profError } = await supabase
            .from('users')
            .select('id, full_name, title, avatar_url, bio')
            .eq('organization_id', orgData.id)
            .eq('slug', professionalSlug)
            .eq('accept_online_booking', true)
            .eq('is_active', true)
            .single();

          if (profData && !profError) {
            setSelectedProfessional(profData);
            
            // Busca serviços específicos do profissional
            const { data: servicesData } = await supabase
              .from('services')
              .select('id, name, description, duration_minutes, price_cents, color')
              .eq('organization_id', orgData.id)
              .eq('professional_id', profData.id)
              .eq('is_active', true);

            if (servicesData) {
              setServices(servicesData);
            }
          }
        } else {
          // Busca todos os serviços da organização
          const { data: servicesData } = await supabase
            .from('services')
            .select('id, name, description, duration_minutes, price_cents, color')
            .eq('organization_id', orgData.id)
            .eq('is_active', true);

          if (servicesData) {
            setServices(servicesData);
          }
        }

      } catch (error) {
        console.error('Error fetching booking data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationSlug, professionalSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !organization) {
    return <BookingNotFound />;
  }

  return (
    <BookingWidget 
      organization={organization} 
      selectedProfessional={selectedProfessional}
      services={services}
    />
  );
};