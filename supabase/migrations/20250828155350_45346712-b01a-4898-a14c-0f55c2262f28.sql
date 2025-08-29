-- Create usage tracking table
CREATE TABLE public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: "2024-01"
  appointments_count INTEGER NOT NULL DEFAULT 0,
  professionals_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, month_year)
);

-- Enable RLS
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_usage
CREATE POLICY "Users can view own organization usage" ON public.subscription_usage
FOR SELECT
USING (organization_id IN (
  SELECT users.organization_id 
  FROM users 
  WHERE users.id = auth.uid()
));

CREATE POLICY "System can manage usage" ON public.subscription_usage
FOR ALL
USING (true);

-- Update subscribers table with new plan types and trial info
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'conhecendo',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

-- Update existing subscribers to have proper plan names
UPDATE public.subscribers 
SET plan_name = CASE 
  WHEN subscription_tier = 'Básico' THEN 'comecei_agora'
  WHEN subscription_tier = 'Profissional' THEN 'comecei_agora'  
  WHEN subscription_tier = 'Enterprise' THEN 'posicionado'
  ELSE 'conhecendo'
END
WHERE plan_name IS NULL OR plan_name = 'conhecendo';

-- Function to get current month usage
CREATE OR REPLACE FUNCTION public.get_current_month_usage(org_id UUID)
RETURNS subscription_usage
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM subscription_usage 
  WHERE organization_id = org_id 
  AND month_year = to_char(now(), 'YYYY-MM')
  LIMIT 1;
$$;

-- Function to increment appointment count
CREATE OR REPLACE FUNCTION public.increment_appointment_count(org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
  INSERT INTO subscription_usage (organization_id, month_year, appointments_count, professionals_count)
  VALUES (org_id, current_month, 1, 0)
  ON CONFLICT (organization_id, month_year) 
  DO UPDATE SET 
    appointments_count = subscription_usage.appointments_count + 1,
    updated_at = now();
END;
$$;

-- Trigger to automatically count appointments
CREATE OR REPLACE FUNCTION public.handle_appointment_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM increment_appointment_count(NEW.organization_id);
  RETURN NEW;
END;
$$;

-- Create trigger for appointment counting
DROP TRIGGER IF EXISTS on_appointment_created ON appointments;
CREATE TRIGGER on_appointment_created
  AFTER INSERT ON appointments
  FOR EACH ROW 
  EXECUTE FUNCTION handle_appointment_created();