
-- Adicionar colunas necessárias para profissionais públicos
ALTER TABLE public.users 
ADD COLUMN slug text,
ADD COLUMN public_profile_enabled boolean DEFAULT false,
ADD COLUMN accept_online_booking boolean DEFAULT false;

-- Adicionar coluna para organizações habilitarem booking público
ALTER TABLE public.organizations 
ADD COLUMN public_booking_enabled boolean DEFAULT true;

-- Criar índice único para slugs de profissionais
CREATE UNIQUE INDEX users_slug_unique_idx ON public.users (slug) WHERE slug IS NOT NULL;

-- Criar índices para performance
CREATE INDEX appointments_professional_date_idx ON public.appointments (professional_id, scheduled_at);
CREATE INDEX appointments_organization_date_idx ON public.appointments (organization_id, scheduled_at);
CREATE INDEX services_organization_active_idx ON public.services (organization_id, is_active);
CREATE INDEX users_organization_role_idx ON public.users (organization_id, role, is_active);

-- Criar trigger para incrementar contador de appointments
CREATE TRIGGER appointment_created_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_appointment_created();

-- Corrigir políticas RLS mais restritivas para subscribers
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

CREATE POLICY "Users can insert own subscription" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update own subscription" 
  ON public.subscribers 
  FOR UPDATE 
  USING (user_id = auth.uid() OR email = auth.email());

-- Corrigir política RLS para subscription_usage (remover permissão total do sistema)
DROP POLICY IF EXISTS "System can manage usage" ON public.subscription_usage;

CREATE POLICY "Organization admins can manage usage" 
  ON public.subscription_usage 
  FOR ALL 
  USING (organization_id IN (
    SELECT users.organization_id 
    FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('super_admin', 'organization_admin')
  ));

-- Política para permitir inserção automática via trigger
CREATE POLICY "Allow usage tracking via trigger" 
  ON public.subscription_usage 
  FOR INSERT 
  WITH CHECK (true);
