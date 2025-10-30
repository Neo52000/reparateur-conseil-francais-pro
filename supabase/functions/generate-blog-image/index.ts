import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const { prompt, size, style } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('🎨 Generating image with Lovable AI:', prompt);

    // Enhanced prompt for blog headers
    let enhancedPrompt = prompt;
    
    // Add blog header specific requirements
    enhancedPrompt += ', 16:9 aspect ratio, blog header image, professional, high quality';
    
    // Enhance prompt based on style
    switch (style) {
      case 'realistic':
        enhancedPrompt += ', photorealistic, professional photography, clean composition';
        break;
      case 'digital-art':
        enhancedPrompt += ', digital art, vibrant colors, modern design, clean aesthetic';
        break;
      case 'illustration':
        enhancedPrompt += ', illustration style, clean lines, artistic, vector-like';
        break;
      case 'minimalist':
        enhancedPrompt += ', minimalist design, clean, simple, modern, lots of white space';
        break;
      case 'corporate':
        enhancedPrompt += ', professional, corporate style, clean, business-like, modern';
        break;
    }
    
    // Add universal quality improvements
    enhancedPrompt += ', no text overlay, suitable for blog header, centered composition';

    console.log('📝 Enhanced prompt:', enhancedPrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable workspace.');
      }
      
      throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 Response structure:', JSON.stringify(data).substring(0, 200));
    
    // Extract base64 image from Lovable AI response
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageBase64) {
      console.error('❌ No image in response:', JSON.stringify(data));
      throw new Error('No image generated in response');
    }

    console.log('✅ Image generated successfully with Lovable AI');

    return new Response(JSON.stringify({ 
      imageUrl: imageBase64,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-blog-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
