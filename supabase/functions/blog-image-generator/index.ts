import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'minimalist' | 'corporate' | 'modern' | 'digital-art';
  size?: string;
}

const UNSPLASH_FALLBACKS = [
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1792&h=1024&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1792&h=1024&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1792&h=1024&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?w=1792&h=1024&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1792&h=1024&fit=crop&q=80',
];

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (token !== SERVICE_ROLE) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid token', success: false }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .single();
      if (roleError || !roleData) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Admin access required', success: false }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    const { prompt, style = 'modern' }: ImageGenerationRequest = await req.json();

    const stylePrompts: Record<string, string> = {
      realistic: 'photorealistic, high quality photography, professional lighting, 8K resolution',
      illustration: 'digital illustration, vibrant colors, modern design, vector style',
      minimalist: 'minimalist design, clean lines, simple composition, professional',
      corporate: 'corporate style, business professional, clean and modern, high quality',
      modern: 'modern design, trendy, contemporary style, professional photography',
      'digital-art': 'digital art, creative, colorful, high quality digital illustration',
    };

    const enhancedPrompt = `Create a professional blog header image: ${prompt}.
Style: ${stylePrompts[style]}.
The image should be suitable for a smartphone repair industry blog,
horizontal format 16:9, high quality, attention-grabbing but professional.`;

    let imageUrl: string | null = null;
    let usedProvider = '';

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (OPENAI_API_KEY) {
      try {
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
            quality: 'high',
          }),
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          imageUrl = aiData.data?.[0]?.url ?? null;
          if (imageUrl) usedProvider = 'OpenAI (gpt-image-1)';
        }
      } catch {
        // fallback handled below
      }
    }

    if (!imageUrl) {
      imageUrl = UNSPLASH_FALLBACKS[Math.floor(Math.random() * UNSPLASH_FALLBACKS.length)];
      usedProvider = 'Unsplash (Fallback)';
    }

    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
        const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1];
          const base64Data = matches[2];
          const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('blog-images')
            .upload(fileName, buffer, {
              contentType: `image/${ext}`,
              upsert: true,
            });
          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabaseAdmin.storage
              .from('blog-images')
              .getPublicUrl(fileName);
            finalImageUrl = publicUrl;
          }
        }
      } catch {
        // keep base64 if upload fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        image_url: finalImageUrl,
        provider: usedProvider,
        style,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
