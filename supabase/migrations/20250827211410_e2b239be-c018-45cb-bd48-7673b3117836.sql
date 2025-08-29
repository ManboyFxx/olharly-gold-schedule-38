-- Create enum types
CREATE TYPE public.user_role AS ENUM ('super_admin', 'organization_admin', 'professional', 'client');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.organization_status AS ENUM ('active', 'inactive', 'suspended', 'trial');

-- Organizations table (white-label clients)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for custom domains (e.g., empresa.olharly.online)
  custom_domain TEXT UNIQUE, -- optional custom domain
  email TEXT,
  phone TEXT,
  address JSONB, -- {street, city, state, country, zipcode}
  status organization_status DEFAULT 'trial',
  
  -- White-label branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#E6B800', -- brand color customization
  secondary_color TEXT DEFAULT '#F5F2ED',
  font_family TEXT DEFAULT 'Inter',
  
  -- Business settings
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  currency TEXT DEFAULT 'BRL',
  
  -- Subscription info
  plan_type TEXT DEFAULT 'starter', -- starter, pro, enterprise
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Users table (linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Professional specific fields
  title TEXT, -- e.g., "Dentista", "Advogado"
  bio TEXT,
  specialties TEXT[], -- array of specialties
  
  -- Client specific fields
  birth_date DATE,
  notes TEXT, -- internal notes about the client
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services offered by professionals
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_cents INTEGER DEFAULT 0, -- price in cents for precision
  color TEXT DEFAULT '#E6B800', -- calendar color
  
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false, -- if appointments need manual approval
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Professional availability slots
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time off periods (holidays, vacations, breaks)
CREATE TABLE public.time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  
  -- Client info (for non-registered clients)
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status appointment_status DEFAULT 'scheduled',
  
  -- Additional data
  notes TEXT, -- internal notes
  client_notes TEXT, -- notes from client
  cancellation_reason TEXT,
  
  -- Notifications
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Organizations are viewable by members" 
ON public.organizations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.organization_id = organizations.id 
    AND users.id = auth.uid()
  )
);

CREATE POLICY "Organization admins can update their organization" 
ON public.organizations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.organization_id = organizations.id 
    AND users.id = auth.uid() 
    AND users.role IN ('super_admin', 'organization_admin')
  )
);

-- RLS Policies for users
CREATE POLICY "Users can view users in their organization" 
ON public.users FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Organization admins can manage users" 
ON public.users FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'organization_admin')
  )
);

-- RLS Policies for services
CREATE POLICY "Services are viewable by organization members" 
ON public.services FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Professionals and admins can manage services" 
ON public.services FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid() 
    AND (role IN ('super_admin', 'organization_admin') OR id = professional_id)
  )
);

-- RLS Policies for availability_slots
CREATE POLICY "Availability viewable by organization members" 
ON public.availability_slots FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Professionals can manage their availability" 
ON public.availability_slots FOR ALL 
USING (professional_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'organization_admin')
  )
);

-- RLS Policies for appointments
CREATE POLICY "Appointments viewable by involved parties" 
ON public.appointments FOR SELECT 
USING (
  professional_id = auth.uid() OR 
  client_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'organization_admin')
  )
);

CREATE POLICY "Appointments manageable by professionals and admins" 
ON public.appointments FOR ALL 
USING (
  professional_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'organization_admin')
  )
);

-- Indexes for better performance
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_users_organization_id ON public.users(organization_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_services_organization_id ON public.services(organization_id);
CREATE INDEX idx_services_professional_id ON public.services(professional_id);
CREATE INDEX idx_availability_slots_professional_id ON public.availability_slots(professional_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_organization_id ON public.appointments(organization_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
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