-- Drop triggers first
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;

-- Now drop and recreate the function with proper security
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
  BEFORE UPDATE ON public.services 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON public.appointments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing RLS policies for time_off table
CREATE POLICY "Time off viewable by organization members" 
ON public.time_off FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Professionals can manage their time off" 
ON public.time_off FOR ALL 
USING (professional_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'organization_admin')
  )
);

-- Add INSERT policy for users (for user registration)
CREATE POLICY "Users can be created during registration" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Add INSERT policy for organizations (for new organization creation)  
CREATE POLICY "Super admins can create organizations" 
ON public.organizations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
  OR auth.uid() IS NULL -- Allow during initial setup
);