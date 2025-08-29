import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  slug?: string;
  public_profile_enabled: boolean;
  accept_online_booking: boolean;
  phone?: string;
  is_active: boolean;
}

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user?.id) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setCurrentUser(data as CurrentUser);
        } else {
          console.error('Error fetching current user:', error);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [user?.id]);

  return { currentUser, loading };
};