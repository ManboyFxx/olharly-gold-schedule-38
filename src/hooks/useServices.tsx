import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents: number;
  color: string;
  is_active: boolean;
  requires_approval: boolean;
  professional_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  users?: {
    full_name: string;
  };
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();

  const fetchServices = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          users:professional_id (
            full_name
          )
        `)
        .eq('organization_id', organization.id)
        .order('name');

      if (data && !error) {
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (data: {
    name: string;
    description?: string;
    duration_minutes: number;
    price_cents?: number;
    color?: string;
    professional_id?: string;
    requires_approval?: boolean;
  }) => {
    if (!organization) return { error: 'No organization found' };

    try {
      const { data: service, error } = await supabase
        .from('services')
        .insert({
          ...data,
          organization_id: organization.id,
          price_cents: data.price_cents || 0,
          color: data.color || '#E6B800',
          is_active: true,
          requires_approval: data.requires_approval || false
        })
        .select()
        .single();

      if (error) throw error;

      await fetchServices();
      return { data: service, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchServices();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await fetchServices();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchServices();
  }, [organization]);

  return {
    services,
    loading,
    refetch: fetchServices,
    createService,
    updateService,
    deleteService,
  };
};