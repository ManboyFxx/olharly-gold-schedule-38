import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { trackBusinessMetric } from '@/lib/monitoring';

export interface Appointment {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  service_id: string;
  professional_id: string;
  organization_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  services?: {
    name: string;
    color?: string;
  } | null;
  users?: {
    full_name: string;
  } | null;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const fetchAppointments = async () => {
    if (!user || !organization) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_id (
            name,
            color
          ),
          users:professional_id (
            full_name
          )
        `)
        .eq('organization_id', organization.id)
        .order('scheduled_at', { ascending: true });

      if (data && !error) {
        setAppointments(data as any);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (data: {
    client_name: string;
    client_email?: string;
    client_phone?: string;
    service_id: string;
    professional_id: string;
    scheduled_at: string;
    client_notes?: string;
  }) => {
    try {
      // Get service duration
      const { data: service } = await supabase
        .from('services')
        .select('duration_minutes, organization_id')
        .eq('id', data.service_id)
        .single();

      if (!service) throw new Error('Service not found');

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          ...data,
          organization_id: service.organization_id,
          duration_minutes: service.duration_minutes,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAppointments();
      return { data: appointment, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchAppointments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAppointments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Real-time updates for appointments
  useRealtimeUpdates('appointments', (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
      fetchAppointments();
      
      // Track business metrics
      if (payload.eventType === 'INSERT') {
        trackBusinessMetric('appointment_created', 1);
      }
    }
  });

  useEffect(() => {
    fetchAppointments();
  }, [user, organization]);

  return {
    appointments,
    loading,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};