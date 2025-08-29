
-- Fix RLS policy for users table to prevent privilege escalation
DROP POLICY IF EXISTS "Organization admins can manage users" ON public.users;

CREATE POLICY "Organization admins can manage users in same org" 
  ON public.users 
  FOR ALL 
  USING (
    organization_id = get_current_user_organization_id() 
    AND get_current_user_role() = ANY (ARRAY['super_admin'::user_role, 'organization_admin'::user_role])
    AND role != 'super_admin'  -- Prevent elevation to super_admin
  )
  WITH CHECK (
    organization_id = get_current_user_organization_id() 
    AND get_current_user_role() = ANY (ARRAY['super_admin'::user_role, 'organization_admin'::user_role])
    AND role != 'super_admin'  -- Prevent elevation to super_admin
  );

-- Add policy to prevent super_admin role changes except by super_admins
CREATE POLICY "Only super_admins can manage super_admins" 
  ON public.users 
  FOR ALL 
  USING (
    get_current_user_role() = 'super_admin'::user_role
    OR role != 'super_admin'::user_role
  )
  WITH CHECK (
    get_current_user_role() = 'super_admin'::user_role
    OR role != 'super_admin'::user_role
  );

-- Improve subscription_usage RLS to prevent unauthorized access
DROP POLICY IF EXISTS "Allow usage tracking via trigger" ON public.subscription_usage;

CREATE POLICY "System can insert usage tracking" 
  ON public.subscription_usage 
  FOR INSERT 
  WITH CHECK (
    -- Only allow inserts from system functions (no direct user inserts)
    current_setting('role') = 'authenticator'
  );

-- Add function to safely check if user can access organization data
CREATE OR REPLACE FUNCTION public.user_can_access_organization(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND organization_id = org_id
    AND is_active = true
  );
$$;

-- Update organizations RLS to use the safer function
DROP POLICY IF EXISTS "Organizations are viewable by members" ON public.organizations;

CREATE POLICY "Organizations viewable by active members" 
  ON public.organizations 
  FOR SELECT 
  USING (user_can_access_organization(id));

-- Add audit trigger for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
  ON public.audit_log 
  FOR SELECT 
  USING (
    get_current_user_role() = ANY (ARRAY['super_admin'::user_role, 'organization_admin'::user_role])
  );

-- Audit function for user role changes
CREATE OR REPLACE FUNCTION public.audit_user_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log role changes
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'role_change',
      'users',
      NEW.id,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for user changes
DROP TRIGGER IF EXISTS audit_user_changes_trigger ON public.users;
CREATE TRIGGER audit_user_changes_trigger
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_user_changes();
