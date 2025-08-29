
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookingWidget } from '@/components/Booking/BookingWidget';
import { BookingNotFound } from '@/components/Booking/BookingNotFound';
import { Skeleton } from '@/components/ui/skeleton';
import { getDomainInfo } from '@/lib/domain';

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

const SlugHandler = () => {
  const { slug } = useParams<{ slug: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const domainInfo = getDomainInfo();
      
      // Debug info for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Domain info:', domainInfo);
        console.log('Slug:', slug);
      }
      
      try {
        // Primeiro, tenta encontrar por slug de organização
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url, primary_color, secondary_color, timezone, language')
          .eq('slug', slug)
          .eq('public_booking_enabled', true)
          .single();

        if (orgData && !orgError) {
          // É uma organização
          setOrganization(orgData);
          
          // Apply custom colors to CSS variables
          document.documentElement.style.setProperty('--primary-color', orgData.primary_color);
          document.documentElement.style.setProperty('--secondary-color', orgData.secondary_color);

          // Busca todos os serviços da organização
          const { data: servicesData } = await supabase
            .from('services')
            .select('id, name, description, duration_minutes, price_cents, color')
            .eq('organization_id', orgData.id)
            .eq('is_active', true);

          if (servicesData) {
            setServices(servicesData);
          }
        } else {
          // Tenta encontrar por slug de profissional
          const { data: professionalData, error: profError } = await supabase
            .from('users')
            .select(`
              id, 
              full_name, 
              title, 
              avatar_url, 
              bio,
              organization_id,
              organizations!inner (
                id, 
                name, 
                slug, 
                logo_url, 
                primary_color, 
                secondary_color, 
                timezone, 
                language,
                public_booking_enabled
              )
            `)
            .eq('slug', slug)
            .eq('accept_online_booking', true)
            .eq('is_active', true)
            .single();

          if (professionalData && !profError && professionalData.organizations?.public_booking_enabled) {
            // É um profissional
            setSelectedProfessional({
              id: professionalData.id,
              full_name: professionalData.full_name,
              title: professionalData.title,
              avatar_url: professionalData.avatar_url,
              bio: professionalData.bio,
            });

            setOrganization(professionalData.organizations);
            
            // Apply custom colors to CSS variables
            document.documentElement.style.setProperty('--primary-color', professionalData.organizations.primary_color);
            document.documentElement.style.setProperty('--secondary-color', professionalData.organizations.secondary_color);

            // Busca serviços específicos do profissional
            const { data: servicesData } = await supabase
              .from('services')
              .select('id, name, description, duration_minutes, price_cents, color')
              .eq('organization_id', professionalData.organization_id)
              .eq('professional_id', professionalData.id)
              .eq('is_active', true);

            if (servicesData) {
              setServices(servicesData);
            }
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

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

export default SlugHandler;
