import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    if (!email) {
      throw new Error('Email é obrigatório')
    }

    // Verificar se o email existe como profissional
    const { data: professional, error: checkError } = await supabaseClient
      .from('users')
      .select('id, role')
      .eq('email', email)
      .eq('role', 'professional')
      .eq('is_active', true)
      .single()

    if (checkError || !professional) {
      throw new Error('Email não encontrado como profissional ativo')
    }

    // Resetar senha para a senha padrão
    const { error: resetError } = await supabaseClient.auth.admin.updateUserById(
      professional.id,
      { password: 'souprofissional' }
    )

    if (resetError) {
      throw new Error(`Erro ao resetar senha: ${resetError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha resetada com sucesso. Use a senha padrão para fazer login.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in reset-professional-password:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})