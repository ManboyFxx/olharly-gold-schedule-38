
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-AVAILABILITY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { professionalId, date, serviceId } = await req.json();

    if (!professionalId || !date || !serviceId) {
      throw new Error("Professional ID, date, and service ID are required");
    }

    logStep("Checking availability", { professionalId, date, serviceId });

    // Buscar informações do serviço
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      throw new Error("Service not found");
    }

    // Buscar disponibilidade do profissional para o dia da semana
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const { data: availabilitySlots, error: availabilityError } = await supabaseClient
      .from('availability_slots')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (availabilityError) {
      throw new Error("Error fetching availability slots");
    }

    // Buscar agendamentos existentes para o dia
    const startOfDay = new Date(requestDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingAppointments, error: appointmentsError } = await supabaseClient
      .from('appointments')
      .select('scheduled_at, duration_minutes')
      .eq('professional_id', professionalId)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (appointmentsError) {
      throw new Error("Error fetching existing appointments");
    }

    // Gerar slots disponíveis
    const availableSlots: string[] = [];
    const serviceDuration = service.duration_minutes;

    for (const slot of availabilitySlots) {
      const startTime = new Date(`${date}T${slot.start_time}`);
      const endTime = new Date(`${date}T${slot.end_time}`);

      // Gerar slots de 30 em 30 minutos dentro do horário disponível
      let currentTime = new Date(startTime);
      
      while (currentTime.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
        const slotEndTime = new Date(currentTime.getTime() + (serviceDuration * 60 * 1000));
        
        // Verificar se não há conflito com agendamentos existentes
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.scheduled_at);
          const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration_minutes * 60 * 1000));
          
          return (currentTime < appointmentEnd && slotEndTime > appointmentStart);
        });

        if (!hasConflict) {
          availableSlots.push(currentTime.toTimeString().slice(0, 5)); // Format: "HH:MM"
        }

        // Avançar 30 minutos
        currentTime = new Date(currentTime.getTime() + (30 * 60 * 1000));
      }
    }

    logStep("Available slots calculated", { slotsCount: availableSlots.length });

    return new Response(JSON.stringify({ availableSlots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
