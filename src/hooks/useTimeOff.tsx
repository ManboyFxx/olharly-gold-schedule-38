import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { toast } from './use-toast';

export interface TimeOff {
  id: string;
  professional_id: string;
  organization_id: string;
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  is_recurring: boolean;
  created_at: string;
}

export const useTimeOff = (professionalId?: string) => {
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const targetProfessionalId = professionalId || user?.id;

  const fetchTimeOff = async () => {
    if (!targetProfessionalId || !organization) return;

    try {
      const { data, error } = await supabase
        .from('time_off')
        .select('*')
        .eq('professional_id', targetProfessionalId)
        .eq('organization_id', organization.id)
        .order('start_date', { ascending: false });

      if (data && !error) {
        setTimeOff(data);
      }
    } catch (error) {
      console.error('Error fetching time off:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTimeOff = async (data: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    is_recurring?: boolean;
  }) => {
    if (!targetProfessionalId || !organization) return { error: 'Missing required data' };

    // Validate dates
    if (new Date(data.start_date) > new Date(data.end_date)) {
      toast({
        title: 'Erro',
        description: 'Data de início deve ser anterior à data de fim.',
        variant: 'destructive',
      });
      return { error: 'Invalid date range' };
    }

    try {
      const { data: newTimeOff, error } = await supabase
        .from('time_off')
        .insert({
          professional_id: targetProfessionalId,
          organization_id: organization.id,
          title: data.title,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          is_recurring: data.is_recurring || false,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTimeOff();
      toast({
        title: 'Sucesso',
        description: 'Período de folga adicionado.',
      });
      
      return { data: newTimeOff, error: null };
    } catch (error) {
      console.error('Error creating time off:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar período de folga.',
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateTimeOff = async (id: string, updates: Partial<TimeOff>) => {
    try {
      const { error } = await supabase
        .from('time_off')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchTimeOff();
      toast({
        title: 'Sucesso',
        description: 'Período de folga atualizado.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error updating time off:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar período de folga.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteTimeOff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_off')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTimeOff();
      toast({
        title: 'Sucesso',
        description: 'Período de folga removido.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting time off:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover período de folga.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const getActiveTimeOff = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeOff.filter(to => to.start_date <= today && to.end_date >= today);
  };

  const getUpcomingTimeOff = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeOff.filter(to => to.start_date > today);
  };

  useEffect(() => {
    fetchTimeOff();
  }, [targetProfessionalId, organization]);

  return {
    timeOff,
    loading,
    refetch: fetchTimeOff,
    createTimeOff,
    updateTimeOff,
    deleteTimeOff,
    getActiveTimeOff,
    getUpcomingTimeOff,
  };
};