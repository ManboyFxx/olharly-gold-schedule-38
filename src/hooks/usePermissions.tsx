import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { useOrganization } from './useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface PlanPermissions {
  maxAppointmentsPerMonth: number;
  maxProfessionals: number;
  hasAdvancedReports: boolean;
  hasWhatsAppIntegration: boolean;
  hasCustomDomain: boolean;
  hasApiAccess: boolean;
  hasMultipleUsers: boolean;
  canExportData: boolean;
  hasPrioritySupport: boolean;
}

export interface UsageStats {
  appointmentsThisMonth: number;
  professionalsCount: number;
}

const PLAN_PERMISSIONS: Record<string, PlanPermissions> = {
  conhecendo: {
    maxAppointmentsPerMonth: -1, // Trial tem tudo liberado (ilimitado)
    maxProfessionals: -1, // Trial tem tudo liberado (ilimitado)
    hasAdvancedReports: true, // Trial tem tudo liberado
    hasWhatsAppIntegration: true,
    hasCustomDomain: true,
    hasApiAccess: true,
    hasMultipleUsers: true,
    canExportData: true,
    hasPrioritySupport: true,
  },
  comecei_agora: {
    maxAppointmentsPerMonth: 60, // 60 agendamentos por mês
    maxProfessionals: 1, // Apenas 1 profissional (o próprio usuário)
    hasAdvancedReports: false,
    hasWhatsAppIntegration: false,
    hasCustomDomain: false,
    hasApiAccess: false,
    hasMultipleUsers: false, // Não pode adicionar outros profissionais
    canExportData: false,
    hasPrioritySupport: false,
  },
  posicionado: {
    maxAppointmentsPerMonth: -1, // Ilimitado
    maxProfessionals: -1, // Ilimitado
    hasAdvancedReports: true,
    hasWhatsAppIntegration: true,
    hasCustomDomain: true,
    hasApiAccess: true,
    hasMultipleUsers: true,
    canExportData: true,
    hasPrioritySupport: true,
  },
};

export const usePermissions = () => {
  const { subscribed, subscriptionTier, loading: subscriptionLoading } = useSubscription();
  const { organization } = useOrganization();

  // Fetch usage statistics
  const { data: usageStats, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-stats', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;

      const currentMonth = new Date().toISOString().slice(0, 7); // "2024-01"
      
      // Get current month usage
      const { data: usage, error: usageError } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      // Log any errors that occur
      if (usageError) {
        console.error('Error fetching usage stats:', usageError);
      }

      // Count professionals in organization
      const { data: professionals, error: profError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', organization.id)
        .neq('role', 'client');

      if (profError) {
        console.error('Error fetching professionals count:', profError);
      }

      return {
        appointmentsThisMonth: usage?.appointments_count || 0,
        professionalsCount: professionals?.length || 0,
      } as UsageStats;
    },
    enabled: !!organization?.id,
  });

  const currentPlan = useMemo(() => {
    if (!subscribed || !subscriptionTier) return 'conhecendo';
    
    // Map subscription tiers to plan names
    const tierMapping: Record<string, string> = {
      'Básico': 'comecei_agora',
      'Profissional': 'comecei_agora',
      'Premium': 'comecei_agora',
      'Enterprise': 'posicionado',
      'Posicionado(a)': 'posicionado',
      'Comecei Agora': 'comecei_agora',
      'Conhecendo': 'conhecendo',
    };

    return tierMapping[subscriptionTier] || 'conhecendo';
  }, [subscribed, subscriptionTier]);

  const permissions = useMemo(() => {
    return PLAN_PERMISSIONS[currentPlan] || PLAN_PERMISSIONS.conhecendo;
  }, [currentPlan]);

  const checkPermission = (action: keyof PlanPermissions): boolean => {
    return permissions[action] as boolean;
  };

  const checkLimit = (type: 'appointments' | 'professionals'): { 
    allowed: boolean; 
    current: number; 
    limit: number; 
    isUnlimited: boolean;
  } => {
    if (!usageStats) {
      return { allowed: true, current: 0, limit: 0, isUnlimited: true };
    }

    if (type === 'appointments') {
      const limit = permissions.maxAppointmentsPerMonth;
      const current = usageStats.appointmentsThisMonth;
      const isUnlimited = limit === -1;
      
      return {
        allowed: isUnlimited || current < limit,
        current,
        limit: isUnlimited ? 0 : limit,
        isUnlimited,
      };
    }

    if (type === 'professionals') {
      const limit = permissions.maxProfessionals;
      const current = usageStats.professionalsCount;
      const isUnlimited = limit === -1;
      
      return {
        allowed: isUnlimited || current < limit,
        current,
        limit: isUnlimited ? 0 : limit,
        isUnlimited,
      };
    }

    return { allowed: true, current: 0, limit: 0, isUnlimited: true };
  };

  const isTrialExpired = useMemo(() => {
    // Check if trial is expired based on organization or subscription data
    // This would need to be implemented based on how trial is tracked
    return false; // Placeholder
  }, []);

  return {
    currentPlan,
    permissions,
    usageStats: usageStats || { appointmentsThisMonth: 0, professionalsCount: 0 },
    loading: subscriptionLoading || usageLoading,
    checkPermission,
    checkLimit,
    isTrialExpired,
    planNames: {
      conhecendo: 'Conhecendo',
      comecei_agora: 'Comecei Agora',
      posicionado: 'Posicionado(a)',
    },
  };
};