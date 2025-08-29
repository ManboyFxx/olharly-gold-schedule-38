
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PUBLIC-APPOINTMENT] ${step}${detailsStr}`);
};

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxAttempts) {
    return false;
  }
  
  current.count++;
  return true;
};

const validateAppointmentData = (data: any) => {
  const { professionalId, serviceId, clientName, clientEmail, clientPhone, scheduledAt } = data;
  
  if (!professionalId || typeof professionalId !== 'string') {
    throw new Error("Professional ID is required");
  }
  
  if (!serviceId || typeof serviceId !== 'string') {
    throw new Error("Service ID is required");
  }
  
  if (!clientName || typeof clientName !== 'string' || clientName.trim().length < 2) {
    throw new Error("Client name is required and must be at least 2 characters");
  }
  
  if (!clientEmail || typeof clientEmail !== 'string') {
    throw new Error("Client email is required");
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clientEmail)) {
    throw new Error("Invalid email format");
  }
  
  if (!scheduledAt || isNaN(new Date(scheduledAt).getTime())) {
    throw new Error("Valid scheduled time is required");
  }
  
  // Prevent booking too far in the future (6 months)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  if (new Date(scheduledAt) > maxDate) {
    throw new Error("Cannot book appointments more than 6 months in advance");
  }
  
  // Prevent booking in the past
  if (new Date(scheduledAt) < new Date()) {
    throw new Error("Cannot book appointments in the past");
  }
  
  // Sanitize strings
  if (clientName.length > 100) throw new Error("Client name too long");
  if (clientEmail.length > 255) throw new Error("Client email too long");
  if (clientPhone && clientPhone.length > 20) throw new Error("Client phone too long");
  
  return {
    professionalId: professionalId.trim(),
    serviceId: serviceId.trim(),
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim().toLowerCase(),
    clientPhone: clientPhone?.trim(),
    scheduledAt
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      logStep("Rate limit exceeded", { clientIP });
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const requestData = await req.json();
    const validatedData = validateAppointmentData(requestData);
    
    const {
      professionalId,
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      scheduledAt,
      clientNotes
    } = validatedData;

    logStep("Creating appointment", { professionalId, serviceId, clientName });

    // Get service information with RLS protection
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('duration_minutes, organization_id, name, professional_id')
      .eq('id', serviceId)
      .eq('professional_id', professionalId)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      throw new Error("Service not found or not available");
    }

    // Verify professional accepts online booking
    const { data: professional, error: profError } = await supabaseClient
      .from('users')
      .select('accept_online_booking, public_profile_enabled, is_active')
      .eq('id', professionalId)
      .single();

    if (profError || !professional?.accept_online_booking || !professional.public_profile_enabled || !professional.is_active) {
      throw new Error("Professional does not accept online bookings");
    }

    // Check for conflicts
    const appointmentStart = new Date(scheduledAt);
    const appointmentEnd = new Date(appointmentStart.getTime() + (service.duration_minutes * 60 * 1000));

    const { data: conflicts, error: conflictError } = await supabaseClient
      .from('appointments')
      .select('id')
      .eq('professional_id', professionalId)
      .gte('scheduled_at', appointmentStart.toISOString())
      .lt('scheduled_at', appointmentEnd.toISOString())
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (conflictError) {
      throw new Error("Error checking availability");
    }

    if (conflicts && conflicts.length > 0) {
      return new Response(JSON.stringify({ error: 'Time slot no longer available' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }

    // Create appointment with sanitized data
    const { data: appointment, error: appointmentError } = await supabaseClient
      .from('appointments')
      .insert({
        professional_id: professionalId,
        service_id: serviceId,
        organization_id: service.organization_id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
        scheduled_at: scheduledAt,
        duration_minutes: service.duration_minutes,
        status: 'scheduled',
        client_notes: clientNotes?.substring(0, 500) || null // Limit notes length
      })
      .select('id, scheduled_at, duration_minutes')
      .single();

    if (appointmentError) {
      logStep("Failed to create appointment", { error: appointmentError });
      throw new Error("Failed to create appointment. Please try again.");
    }

    logStep("Appointment created successfully", { appointmentId: appointment.id });

    return new Response(JSON.stringify({
      success: true,
      appointment: {
        id: appointment.id,
        scheduled_at: appointment.scheduled_at,
        duration_minutes: appointment.duration_minutes,
        service_name: service.name
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    const publicError = errorMessage.includes('required') || 
                       errorMessage.includes('Invalid') || 
                       errorMessage.includes('too long') ||
                       errorMessage.includes('not available') ||
                       errorMessage.includes('not accept') ||
                       errorMessage.includes('Time slot')
      ? errorMessage 
      : 'Unable to create appointment. Please try again.';
      
    const statusCode = errorMessage.includes('Time slot') ? 409 : 
                      errorMessage.includes('required') || errorMessage.includes('Invalid') ? 400 : 500;
      
    return new Response(JSON.stringify({ error: publicError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
