-- Create notification settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT false,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24,
  confirmation_enabled BOOLEAN NOT NULL DEFAULT true,
  cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  no_show_tracking BOOLEAN NOT NULL DEFAULT false,
  custom_email_template TEXT DEFAULT '',
  custom_sms_template TEXT DEFAULT '',
  notification_sender_name TEXT DEFAULT '',
  notification_sender_email TEXT DEFAULT '',
  whatsapp_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization members can view notification settings"
ON public.notification_settings
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Organization admins can manage notification settings"
ON public.notification_settings
FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM users 
  WHERE id = auth.uid() 
  AND role IN ('super_admin', 'organization_admin')
));

-- Create trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();