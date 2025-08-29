-- Fix RLS policies for users table to allow users to access their own data
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;
DROP POLICY IF EXISTS "Organization admins can manage users" ON public.users;

-- Allow users to view their own profile always (for initial setup)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT 
  USING (id = auth.uid());

-- Allow users to view other users in their organization (after they have one)
CREATE POLICY "Users can view organization members" ON public.users
  FOR SELECT 
  USING (
    organization_id IS NOT NULL 
    AND organization_id = get_current_user_organization_id()
    AND get_current_user_organization_id() IS NOT NULL
  );

-- Allow organization admins to manage users in their organization
CREATE POLICY "Organization admins can manage users" ON public.users
  FOR ALL 
  USING (
    organization_id = get_current_user_organization_id() 
    AND get_current_user_role() IN ('super_admin', 'organization_admin')
  );