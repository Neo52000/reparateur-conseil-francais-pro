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

    // 1️⃣ Essayer Lovable AI (Gemini Image) avec modalities
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
            messages: [{ role: 'user', content: `Generate this image: ${enhancedPrompt}` }],
            modalities: ['image', 'text']
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          console.log('📸 Lovable AI response received');
          
          // Récupérer l'image base64 ou URL
          const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (imageData) {
            imageUrl = imageData;
            usedProvider = 'Lovable AI (Gemini)';
            console.log('✅ Lovable AI succeeded - Image generated');
          } else {
            console.log('⚠️ Lovable AI: No image in response');
            console.log('   Response structure:', JSON.stringify(aiData.choices?.[0]?.message, null, 2).substring(0, 500));
          }
        } else {
          const errorText = await aiResponse.text();
          console.log(`⚠️ Lovable AI failed (${aiResponse.status}): ${errorText.substring(0, 200)}`);
          if (aiResponse.status === 402) {
            console.log('   → No credits available');
          } else if (aiResponse.status === 429) {
            console.log('   → Rate limited');
          }
        }
      } catch (error) {
        console.log('⚠️ Lovable AI exception:', error.message);
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

    // 3️⃣ Fallback Unsplash avec image pertinente
    if (!imageUrl) {
      // Utiliser un ensemble d'images Unsplash de haute qualité pour la réparation tech
      const unsplashImages = [
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1792&h=1024&fit=crop&q=80', // smartphone
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1792&h=1024&fit=crop&q=80', // repair tools
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1792&h=1024&fit=crop&q=80', // phone screen
        'https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?w=1792&h=1024&fit=crop&q=80', // tech
        'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1792&h=1024&fit=crop&q=80'  // electronics
      ];
      imageUrl = unsplashImages[Math.floor(Math.random() * unsplashImages.length)];
      usedProvider = 'Unsplash (Fallback)';
      console.log('⚠️ Using Unsplash fallback image');
    }

    // 4️⃣ Upload vers Supabase Storage si image base64
    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        console.log('📤 Uploading base64 image to Supabase Storage...');
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Extraire le type et les données
        const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1];
          const base64Data = matches[2];
          const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('blog-images')
            .upload(fileName, buffer, {
              contentType: `image/${ext}`,
              upsert: true
            });

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabaseAdmin.storage
              .from('blog-images')
              .getPublicUrl(fileName);
            
            finalImageUrl = publicUrl;
            console.log('✅ Image uploaded to Storage:', finalImageUrl);
          } else {
            console.log('⚠️ Storage upload failed, keeping base64:', uploadError?.message);
          }
        }
      } catch (storageError) {
        console.log('⚠️ Storage error, keeping original URL:', storageError.message);
      }
    }

    console.log(`✅ Image générée avec: ${usedProvider}`);

    return new Response(
      JSON.stringify({
        success: true,
        image_url: finalImageUrl,
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
