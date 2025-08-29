import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  status: 'trial' | 'active' | 'suspended' | 'inactive';
  plan_type: string;
  custom_domain?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  refetch: () => Promise<void>;
  createOrganization: (data: Partial<Organization>) => Promise<{ error?: any }>;
  updateOrganization: (data: Partial<Organization>) => Promise<{ error?: any }>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrganization = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // First get user's organization_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.organization_id) {
        setOrganization(null);
        setLoading(false);
        return;
      }

      // Then fetch the organization
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (data && !error) {
        setOrganization(data);
      } else {
        setOrganization(null);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (data: Partial<Organization>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name!,
          slug: data.slug!,
          primary_color: data.primary_color || '#E6B800',
          secondary_color: data.secondary_color || '#F5F2ED',
          font_family: data.font_family || 'Inter',
          status: 'trial'
        })
        .select()
        .single();

      if (orgError) return { error: orgError };

      // Update user's organization_id
      const { error: userError } = await supabase
        .from('users')
        .update({ organization_id: orgData.id })
        .eq('id', user.id);

      if (userError) return { error: userError };

      setOrganization(orgData);
      toast({
        title: 'Organização criada!',
        description: 'Sua organização foi configurada com sucesso.',
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateOrganization = async (data: Partial<Organization>) => {
    if (!organization) return { error: 'No organization found' };

    try {
      const { data: updatedData, error } = await supabase
        .from('organizations')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id)
        .select()
        .single();

      if (error) return { error };

      setOrganization(updatedData);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [user]);

  const value = {
    organization,
    loading,
    refetch: fetchOrganization,
    createOrganization,
    updateOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};