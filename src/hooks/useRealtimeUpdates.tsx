import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { trackEvent } from '@/lib/monitoring';

export const useRealtimeUpdates = (
  table: string,
  onUpdate: (payload: any) => void,
  filter?: string
) => {
  const { user } = useAuth();
  const { organization } = useOrganization();

  useEffect(() => {
    if (!user || !organization) return;

    let channel = supabase
      .channel(`realtime_${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || `organization_id=eq.${organization.id}`
        },
        (payload) => {
          trackEvent('realtime_update', {
            table,
            event: payload.eventType,
            user_id: user.id
          });
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, organization, table, filter, onUpdate]);
};