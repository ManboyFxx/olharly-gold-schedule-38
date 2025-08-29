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

    // Verificar se o usuário está autenticado
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Verificar se o usuário tem permissão (organization_admin)
    const { data: currentUser } = await supabaseClient
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (!currentUser || !['organization_admin', 'super_admin'].includes(currentUser.role)) {
      throw new Error('Sem permissão para criar profissionais')
    }

    const { email, full_name, phone, title, role, organization_id } = await req.json()

    // Verificar se a organização pertence ao usuário atual
    if (currentUser.organization_id !== organization_id) {
      throw new Error('Não é possível criar profissional para outra organização')
    }

    // Verificar se o email já existe
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email)
    
    if (existingUser.user) {
      throw new Error('Este email já está cadastrado no sistema')
    }

    // Criar usuário no auth.users (usando service role)
    const { data: newUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      email_confirm: true, // Já confirma o email automaticamente
      user_metadata: {
        full_name
      }
    })

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`)
    }

    // Criar perfil na tabela users
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert({
        id: newUser.user.id,
        email,
        full_name,
        phone: phone || null,
        title: title || null,
        role,
        organization_id,
        is_active: true,
        accept_online_booking: false // Desabilitado por padrão
      })

    if (profileError) {
      // Se falhar ao criar o perfil, deletar o usuário do auth
      await supabaseClient.auth.admin.deleteUser(newUser.user.id)
      throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        message: 'Profissional criado com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-professional:', error)
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