import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    // Check if user is new (created recently) for automatic trial
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('created_at')
      .eq('id', user.id)
      .single();
    
    const isNewUser = userProfile && new Date(userProfile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h
    
    if (customers.data.length === 0) {
      logStep("No customer found, setting up trial for new user", { isNewUser });
      
      // For new users, set up automatic 3-day trial
      const trialEndsAt = isNewUser ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null; // 3 days from now
      
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: isNewUser, // Auto-subscribed during trial
        subscription_tier: null,
        subscription_end: null,
        plan_name: 'conhecendo',
        is_trial: isNewUser,
        trial_ends_at: trialEndsAt?.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ 
        subscribed: isNewUser, 
        subscription_tier: 'Conhecendo',
        plan_name: 'conhecendo',
        is_trial: isNewUser,
        trial_ends_at: trialEndsAt?.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let planName = 'conhecendo';

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier and plan from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      // Map price to plan names based on new pricing
      if (priceId.includes('comecei_agora') || amount <= 2990) {
        subscriptionTier = "Comecei Agora";
        planName = 'comecei_agora';
      } else if (priceId.includes('posicionado') || amount <= 4990) {
        subscriptionTier = "Posicionado(a)";
        planName = 'posicionado';
      } else {
        subscriptionTier = "Premium";
        planName = 'posicionado';
      }
      
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier, planName });
    } else {
      logStep("No active subscription found");
      
      // Check if user should still be on trial
      const { data: existingSubscriber } = await supabaseClient
        .from('subscribers')
        .select('trial_ends_at, is_trial')
        .eq('email', user.email)
        .single();
      
      const isStillOnTrial = existingSubscriber?.is_trial && 
        existingSubscriber?.trial_ends_at && 
        new Date(existingSubscriber.trial_ends_at) > new Date();
      
      if (isStillOnTrial) {
        planName = 'conhecendo';
        subscriptionTier = 'Conhecendo';
      }
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      plan_name: planName,
      is_trial: false, // Only new users get trial
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier, planName });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      plan_name: planName
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});