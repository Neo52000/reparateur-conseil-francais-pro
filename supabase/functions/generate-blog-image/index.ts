
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt, size, style } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating image with prompt:', prompt);

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

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size || '1024x1024',
        quality: 'hd'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    console.log('Image generated successfully');

    return new Response(JSON.stringify({ 
      imageUrl,
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
