import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  Username: string;
  Password: string;
}

interface AuthResponse {
  AccessToken: string;
  ExpiresIn: number;
  AllowedRepairer: string[];
  isIntermediary: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { Username, Password }: AuthRequest = await req.json();

    if (!Username || !Password) {
      return new Response(
        JSON.stringify({ error: 'Username and Password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 QualiRépar v3 Auth attempt for:', Username);

    // Vérifier les credentials dans la base
    const { data: authData, error: authError } = await supabase
      .from('qualirepar_auth_credentials')
      .select('*')
      .eq('username', Username)
      .eq('password', Password) // In production, use proper hashing
      .eq('is_active', true)
      .single();

    if (authError || !authData) {
      console.error('❌ Auth failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer un token JWT-like (simplified for demo)
    const tokenPayload = {
      username: Username,
      userId: authData.user_id,
      isIntermediary: authData.is_intermediary || false,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    const token = btoa(JSON.stringify(tokenPayload));

    // Récupérer les réparateurs autorisés
    const { data: allowedRepairers, error: repairersError } = await supabase
      .from('qualirepar_auth_repairers')
      .select('repairer_code')
      .eq('auth_id', authData.id)
      .eq('is_active', true);

    if (repairersError) {
      console.error('Error fetching allowed repairers:', repairersError);
    }

    const allowedRepairerCodes = allowedRepairers?.map(r => r.repairer_code) || [];

    const response: AuthResponse = {
      AccessToken: token,
      ExpiresIn: 3600,
      AllowedRepairer: allowedRepairerCodes,
      isIntermediary: authData.is_intermediary || false
    };

    // Log successful auth
    await supabase
      .from('qualirepar_api_logs')
      .insert({
        endpoint: '/login',
        method: 'POST',
        user_id: authData.user_id,
        request_data: { username: Username },
        response_data: { success: true, token_issued: true },
        status_code: 200,
        execution_time_ms: 0
      });

    console.log('✅ Auth successful for:', Username, 'Repairers:', allowedRepairerCodes.length);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Auth error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});