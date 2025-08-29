import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { toast } from './use-toast';

export interface AvailabilitySlot {
  id: string;
  professional_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_active: boolean;
  organization_id: string;
  created_at: string;
}

export const useAvailability = (professionalId?: string) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const targetProfessionalId = professionalId || user?.id;

  const fetchAvailability = async () => {
    if (!targetProfessionalId || !organization) return;

    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('professional_id', targetProfessionalId)
        .eq('organization_id', organization.id)
        .order('day_of_week')
        .order('start_time');

      if (data && !error) {
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAvailabilitySlot = async (data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) => {
    if (!targetProfessionalId || !organization) return { error: 'Missing required data' };

    // Validate times
    if (data.start_time >= data.end_time) {
      toast({
        title: 'Erro',
        description: 'Horário de início deve ser menor que o horário de fim.',
        variant: 'destructive',
      });
      return { error: 'Invalid time range' };
    }

    try {
      const { data: slot, error } = await supabase
        .from('availability_slots')
        .insert({
          professional_id: targetProfessionalId,
          organization_id: organization.id,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAvailability();
      toast({
        title: 'Sucesso',
        description: 'Horário de disponibilidade adicionado.',
      });
      
      return { data: slot, error: null };
    } catch (error) {
      console.error('Error creating availability slot:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar horário de disponibilidade.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateAvailabilitySlot = async (id: string, updates: Partial<AvailabilitySlot>) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchAvailability();
      toast({
        title: 'Sucesso',
        description: 'Horário de disponibilidade atualizado.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error updating availability slot:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar horário de disponibilidade.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteAvailabilitySlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAvailability();
      toast({
        title: 'Sucesso',
        description: 'Horário de disponibilidade removido.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover horário de disponibilidade.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const getAvailabilityByDay = (dayOfWeek: number) => {
    return availability.filter(slot => slot.day_of_week === dayOfWeek && slot.is_active);
  };

  useEffect(() => {
    fetchAvailability();
  }, [targetProfessionalId, organization]);

  return {
    availability,
    loading,
    refetch: fetchAvailability,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailabilityByDay,
  };
};