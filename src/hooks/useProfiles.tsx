
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { toast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface ProfessionalProfile {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  slug?: string;
  public_profile_enabled: boolean;
  accept_online_booking: boolean;
  phone?: string;
  specialties?: string[];
  role: UserRole;
}

export const useProfiles = () => {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useOrganization();

  const fetchProfessionals = async () => {
    if (!user || !organization) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organization.id)
        .neq('role', 'client')
        .eq('is_active', true)
        .order('full_name');

      if (data && !error) {
        setProfessionals(data as any);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfessionalProfile = async (
    professionalId: string, 
    updates: Partial<Omit<ProfessionalProfile, 'role'>>
  ) => {
    try {
      // Validar slug se fornecido
      if (updates.slug) {
        // Verificar se slug já existe
        const { data: existingSlug } = await supabase
          .from('users')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', professionalId)
          .single();

        if (existingSlug) {
          toast({
            title: 'Erro',
            description: 'Este slug já está sendo usado por outro profissional.',
            variant: 'destructive',
          });
          return { error: 'Slug already exists' };
        }

        // Validar formato do slug (apenas letras, números e hífens)
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(updates.slug)) {
          toast({
            title: 'Erro',
            description: 'O slug deve conter apenas letras minúsculas, números e hífens.',
            variant: 'destructive',
          });
          return { error: 'Invalid slug format' };
        }
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', professionalId);

      if (error) throw error;

      await fetchProfessionals();
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso.',
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating professional profile:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil. Tente novamente.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
  };

  useEffect(() => {
    fetchProfessionals();
  }, [user, organization]);

  return {
    professionals,
    loading,
    refetch: fetchProfessionals,
    updateProfessionalProfile,
    generateSlugFromName,
  };
};
