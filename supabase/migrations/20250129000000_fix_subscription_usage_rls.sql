-- Fix subscription_usage RLS to allow users to view their organization usage
-- The previous migration removed the SELECT policy for regular users

-- Add back the SELECT policy for users to view their organization usage
CREATE POLICY "Users can view own organization usage" 
  ON public.subscription_usage 
  FOR SELECT 
  USING (organization_id IN (
    SELECT users.organization_id 
    FROM users 
    WHERE users.id = auth.uid()
    AND users.is_active = true
  ));

-- Keep the admin policy for full management
-- The "Organization admins can manage usage" policy already exists and covers INSERT/UPDATE/DELETE