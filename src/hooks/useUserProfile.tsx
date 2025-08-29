import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'organization_admin' | 'professional';
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          setError(error.message);
          setProfile(null);
        } else {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        setError('Erro ao carregar perfil do usuário');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const isOwner = profile?.role === 'organization_admin';
  const isProfessional = profile?.role === 'professional';

  return {
    profile,
    loading,
    error,
    isOwner,
    isProfessional,
  };
};