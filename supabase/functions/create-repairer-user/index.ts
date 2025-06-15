
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { email, first_name, last_name, phone } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Vérifier d'abord si l'utilisateur existe déjà
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({ email });
    if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), { status: 500, headers: corsHeaders });
    }
    if (userData?.users && userData.users.length > 0) {
      // Utilisateur déjà existant (on retourne son id !)
      return new Response(JSON.stringify({ user_id: userData.users[0].id, alreadyExists: true }), { status: 200, headers: corsHeaders });
    }

    // Créer le nouvel utilisateur avec invitation par email simplifiée
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        first_name: first_name || "",
        last_name: last_name || "",
        phone: phone || ""
      }
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ user_id: data.user?.id }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur: " + String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
}, { port: 8000 }); // port ignored by Supabase
