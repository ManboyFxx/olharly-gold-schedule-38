-- First, let's create the proper database structure
-- Create custom types
CREATE TYPE user_role AS ENUM ('organization_admin', 'staff_member', 'client');

-- Create users table (for our custom users, not auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) UNIQUE,
  organization_id UUID,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  title TEXT,
  bio TEXT,
  specialties TEXT[],
  birth_date DATE,
  notes TEXT,
  notification_preferences JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  role user_role DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#E6B800',
  secondary_color TEXT DEFAULT '#F5F5F0',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  business_hours JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  booking_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint to users
ALTER TABLE public.users 
ADD CONSTRAINT fk_organization 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER DEFAULT 0,
  color TEXT DEFAULT '#E6B800',
  is_active BOOLEAN DEFAULT true,
  buffer_minutes INTEGER DEFAULT 0,
  max_advance_booking_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own data" ON public.users
FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Organization admins can view their organization users" ON public.users
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE auth_user_id = auth.uid() AND role = 'organization_admin'
  )
);

-- Create policies for organizations table
CREATE POLICY "Organization members can view their organization" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can update their organization" ON public.organizations
FOR UPDATE USING (
  id IN (
    SELECT organization_id FROM public.users 
    WHERE auth_user_id = auth.uid() AND role = 'organization_admin'
  )
);

-- Create policies for services table
CREATE POLICY "Organization members can view their services" ON public.services
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can manage their services" ON public.services
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.users 
    WHERE auth_user_id = auth.uid() AND role = 'organization_admin'
  )
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'organization_admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();