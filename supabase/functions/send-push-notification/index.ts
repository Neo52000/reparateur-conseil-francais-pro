import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, type, entityType, entityId, metadata } = await req.json();

    if (!userId || !title || !body || !type) {
      throw new Error('Missing required fields: userId, title, body, type');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Sending push notification to user:', userId, 'Type:', type);

    // Créer la notification
    const { data: notification, error } = await supabase
      .from('push_notifications')
      .insert({
        user_id: userId,
        title,
        body,
        type,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {},
        is_read: false,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log('Notification created successfully:', notification.id);

    // TODO: Intégrer avec un service de push notifications réel (Firebase, OneSignal, etc.)
    // Pour l'instant, on stocke juste en DB et l'UI affichera via polling/realtime

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
