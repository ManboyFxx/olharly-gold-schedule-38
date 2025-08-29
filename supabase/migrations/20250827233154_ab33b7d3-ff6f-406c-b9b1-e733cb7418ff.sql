-- Update the RLS policy for organization creation
-- Allow authenticated users to create organizations (for onboarding)
DROP POLICY IF EXISTS "Super admins can create organizations" ON public.organizations;

CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure we have a policy for users to update their own organization
-- after they become organization_admin through the trigger
DROP POLICY IF EXISTS "Organization admins can update their organization" ON public.organizations;

CREATE POLICY "Organization admins can update their organization" ON public.organizations
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.organization_id = organizations.id 
      AND users.id = auth.uid() 
      AND users.role IN ('super_admin', 'organization_admin')
    )
  );