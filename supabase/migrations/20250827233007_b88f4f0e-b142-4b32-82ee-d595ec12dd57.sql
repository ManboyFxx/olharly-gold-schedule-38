
-- First, let's create a security definer function to get the current user's role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create another function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Organization admins can manage users" ON public.users;

-- Create a new policy using the security definer function
CREATE POLICY "Organization admins can manage users" ON public.users
  FOR ALL 
  USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.get_current_user_role() IN ('super_admin', 'organization_admin')
  );

-- Also update the SELECT policy to use the function
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;

CREATE POLICY "Users can view users in their organization" ON public.users
  FOR SELECT 
  USING (organization_id = public.get_current_user_organization_id());
