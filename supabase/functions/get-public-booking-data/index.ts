import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-PUBLIC-BOOKING-DATA] ${step}${detailsStr}`);
};

const validateInput = (slug: string, organizationSlug?: string) => {
  if (!slug || typeof slug !== 'string') {
    throw new Error("Professional slug is required and must be a string");
  }
  
  const slugRegex = /^[a-z0-9-]+$/i;
  if (!slugRegex.test(slug)) {
    throw new Error("Invalid slug format");
  }
  
  if (organizationSlug && !slugRegex.test(organizationSlug)) {
    throw new Error("Invalid organization slug format");
  }
  
  if (slug.length > 100 || (organizationSlug && organizationSlug.length > 100)) {
    throw new Error("Slug too long");
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    const organizationSlug = url.searchParams.get('organizationSlug');

    validateInput(slug!, organizationSlug || undefined);

    logStep("Searching for professional", { slug, organizationSlug });

    let query = supabaseClient
      .from('users')
      .select(`
        id,
        full_name,
        title,
        bio,
        avatar_url,
        slug,
        public_profile_enabled,
        accept_online_booking,
        organization_id,
        organizations!inner (
          id,
          name,
          slug,
          logo_url,
          primary_color,
          secondary_color,
          font_family,
          timezone,
          language,
          public_booking_enabled
        )
      `)
      .eq('slug', slug)
      .eq('public_profile_enabled', true)
      .eq('accept_online_booking', true)
      .eq('is_active', true);

    if (organizationSlug) {
      query = query.eq('organizations.slug', organizationSlug);
    }

    const { data: professional, error: professionalError } = await query.single();

    if (professionalError || !professional) {
      logStep("Professional not found", { slug, error: professionalError });
      return new Response(JSON.stringify({ error: 'Professional not found' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!professional.organizations.public_booking_enabled) {
      return new Response(JSON.stringify({ error: 'Public booking not enabled for this organization' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { data: services, error: servicesError } = await supabaseClient
      .from('services')
      .select('id, name, description, duration_minutes, price_cents, color')
      .eq('professional_id', professional.id)
      .eq('is_active', true)
      .order('name');

    const { data: availability, error: availabilityError } = await supabaseClient
      .from('availability_slots')
      .select('day_of_week, start_time, end_time')
      .eq('professional_id', professional.id)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    const result = {
      professional: {
        id: professional.id,
        full_name: professional.full_name,
        title: professional.title,
        bio: professional.bio,
        avatar_url: professional.avatar_url,
      },
      organization: {
        name: professional.organizations.name,
        logo_url: professional.organizations.logo_url,
        primary_color: professional.organizations.primary_color,
        secondary_color: professional.organizations.secondary_color,
        font_family: professional.organizations.font_family,
      },
      services: services || [],
      availability: availability || [],
    };

    logStep("Returning booking data", { professionalId: professional.id, servicesCount: services?.length || 0 });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    const publicError = errorMessage.includes('Invalid') || errorMessage.includes('required') 
      ? errorMessage 
      : 'Internal server error';
      
    return new Response(JSON.stringify({ error: publicError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: errorMessage.includes('Invalid') || errorMessage.includes('required') ? 400 : 500,
    });
  }
});