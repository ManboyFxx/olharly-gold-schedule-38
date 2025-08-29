import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { useErrorHandler } from './useErrorHandler';

interface NotificationTemplate {
  id: string;
  type: 'confirmation' | 'reminder' | 'cancellation';
  subject: string;
  content: string;
  is_active: boolean;
}

export const useNotifications = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { handleError } = useErrorHandler();

  const fetchTemplates = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('organization_id', organization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no settings exist, create default ones
      if (!data) {
        await createDefaultSettings();
      } else {
        // Parse custom templates from settings
        setTemplates([
          {
            id: 'confirmation',
            type: 'confirmation',
            subject: 'Agendamento Confirmado',
            content: data.custom_email_template || 'Seu agendamento foi confirmado.',
            is_active: data.confirmation_enabled
          },
          {
            id: 'reminder',
            type: 'reminder',
            subject: 'Lembrete de Agendamento',
            content: 'Você tem um agendamento amanhã.',
            is_active: data.email_notifications
          }
        ]);
      }
    } catch (error) {
      handleError(error, 'fetching notification templates');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('notification_settings')
        .insert({
          organization_id: organization.id,
          email_notifications: true,
          confirmation_enabled: true,
          reminder_hours_before: 24,
          custom_email_template: 'Olá! Seu agendamento foi confirmado para {date} às {time}.',
          notification_sender_name: organization.name,
          notification_sender_email: organization.email || 'noreply@olharly.online'
        });

      if (error) throw error;
      await fetchTemplates();
    } catch (error) {
      handleError(error, 'creating default notification settings');
    }
  };

  const sendNotification = async (
    type: 'confirmation' | 'reminder' | 'cancellation',
    recipientEmail: string,
    appointmentData: {
      clientName: string;
      date: string;
      time: string;
      serviceName: string;
      professionalName: string;
    }
  ) => {
    try {
      // This would typically call an edge function to send emails
      const response = await supabase.functions.invoke('send-notification', {
        body: {
          type,
          recipient: recipientEmail,
          appointment: appointmentData,
          organizationId: organization?.id
        }
      });

      if (response.error) throw response.error;
      return { success: true };
    } catch (error) {
      handleError(error, `sending ${type} notification`);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [organization]);

  return {
    templates,
    loading,
    sendNotification,
    refetch: fetchTemplates
  };
};