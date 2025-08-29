import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  appointment_count?: number;
  last_appointment?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();

  const fetchClients = async () => {
    if (!organization) return;

    try {
      // Get clients who are members of the organization with appointment stats in a single query
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          appointments:appointments!client_id (
            scheduled_at
          )
        `)
        .eq('organization_id', organization.id)
        .eq('role', 'client')
        .order('full_name');

      if (data && !error) {
        const clientsWithStats = data.map((client: any) => ({
          ...client,
          appointment_count: client.appointments?.length || 0,
          last_appointment: client.appointments?.[0]?.scheduled_at || null,
          appointments: undefined // Remove the joined data from the final object
        }));

        setClients(clientsWithStats);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (data: {
    full_name: string;
    email: string;
    phone?: string;
    birth_date?: string;
    notes?: string;
  }) => {
    if (!organization) return { error: 'No organization found' };

    try {
      // Note: For clients created through this function, they would need to be created
      // through the auth system first. For now, we'll store client info in a separate way
      // or assume they're already auth users being assigned client role
      
      const { data: client, error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          birth_date: data.birth_date,
          notes: data.notes,
          organization_id: organization.id,
          role: 'client',
          is_active: true
        })
        .eq('email', data.email)
        .select()
        .single();

      if (error) throw error;

      await fetchClients();
      return { data: client, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchClients();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await fetchClients();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getClientById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchClients();
  }, [organization]);

  return {
    clients,
    loading,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
  };
};