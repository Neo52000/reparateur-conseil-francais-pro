import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'minimalist' | 'corporate' | 'modern' | 'digital-art';
  size?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔐 AUTHENTIFICATION HYBRIDE: Support JWT utilisateur + SERVICE_ROLE
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    let isServiceRole = false;
    let userId = null;
    
    // Mode 1: SERVICE_ROLE (appels internes depuis blog-ai-generator)
    if (token === SERVICE_ROLE) {
      console.log('✅ Accès autorisé via SERVICE_ROLE (appel interne)');
      isServiceRole = true;
    } else {
      // Mode 2: JWT utilisateur (appels frontend)
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Token invalide:', authError);
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid token', success: false }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = user.id;

      // Vérifier le rôle admin pour les appels utilisateur
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .single();

      if (roleError || !roleData) {
        console.error('❌ Accès refusé: utilisateur non-admin', { userId: user.id });
        return new Response(
          JSON.stringify({ error: 'Forbidden: Admin access required', success: false }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`✅ Accès autorisé pour l'admin: ${user.email}`);
    }

    const { prompt, style = 'modern' }: ImageGenerationRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Styles prédéfinis pour améliorer la qualité des images
    const stylePrompts = {
      realistic: 'photorealistic, high quality photography, professional lighting, 8K resolution',
      illustration: 'digital illustration, vibrant colors, modern design, vector style',
      minimalist: 'minimalist design, clean lines, simple composition, professional',
      corporate: 'corporate style, business professional, clean and modern, high quality',
      modern: 'modern design, trendy, contemporary style, professional photography'
    };

    const enhancedPrompt = `Create a professional blog header image: ${prompt}. 
Style: ${stylePrompts[style]}. 
The image should be suitable for a smartphone repair industry blog, 
horizontal format 16:9, high quality, attention-grabbing but professional.`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // 🔄 SYSTÈME DE FALLBACK IA: Lovable AI → OpenAI DALL-E → Unsplash
    let imageUrl: string | null = null;
    let usedProvider = '';

    // 1️⃣ Essayer Lovable AI (Gemini Image)
    if (LOVABLE_API_KEY) {
      try {
        console.log('🔹 Trying Lovable AI (Gemini Image)...');
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [{ role: 'user', content: enhancedPrompt }],
            max_tokens: 1024
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageUrl) {
            usedProvider = 'Lovable AI (Gemini)';
            console.log('✅ Lovable AI succeeded');
          }
        } else if (aiResponse.status === 402) {
          console.log('⚠️ Lovable AI: No credits, trying fallback...');
        } else if (aiResponse.status === 429) {
          console.log('⚠️ Lovable AI: Rate limited, trying fallback...');
        }
      } catch (error) {
        console.log('⚠️ Lovable AI failed:', error.message);
      }
    }

    // 2️⃣ Fallback OpenAI DALL-E
    if (!imageUrl) {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (OPENAI_API_KEY) {
        try {
          console.log('🔹 Trying OpenAI DALL-E...');
          const aiResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: enhancedPrompt,
              n: 1,
              size: '1792x1024',
              quality: 'high'
            })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            imageUrl = aiData.data?.[0]?.url;
            if (imageUrl) {
              usedProvider = 'OpenAI (DALL-E)';
              console.log('✅ OpenAI DALL-E succeeded');
            }
          }
        } catch (error) {
          console.log('⚠️ OpenAI DALL-E failed:', error.message);
        }
      }
    }

    // 3️⃣ Fallback Unsplash placeholder
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1792&h=1024&fit=crop&q=80';
      usedProvider = 'Unsplash (Placeholder)';
      console.log('⚠️ Using Unsplash placeholder image');
    }

    console.log(`✅ Image générée avec: ${usedProvider}`);

    return new Response(
      JSON.stringify({
        success: true,
        image_url: imageUrl,
        provider: usedProvider,
        style
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blog-image-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
