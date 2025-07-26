import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  content_type: 'ad_title' | 'ad_description' | 'image' | 'video';
  source_item: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
  };
  style: 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium';
  target_audience?: string;
  additional_context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const request: GenerationRequest = await req.json();

    // Générer le contenu selon le type
    let generatedContent: any = {};
    let aiModel = 'GPT-4';
    let generationCost = 0.02;

    switch (request.content_type) {
      case 'ad_title':
        generatedContent = await generateAdTitle(request);
        break;
      case 'ad_description':
        generatedContent = await generateAdDescription(request);
        break;
      case 'image':
        generatedContent = await generateImage(request);
        aiModel = 'DALL-E 3';
        generationCost = 0.08;
        break;
      case 'video':
        generatedContent = await generateVideo(request);
        aiModel = 'Runway ML';
        generationCost = 0.15;
        break;
    }

    // Calculer le score de qualité
    const qualityScore = calculateQualityScore(generatedContent, request);

    // Sauvegarder le contenu généré
    const { data: savedContent, error: saveError } = await supabase
      .from('ai_generated_content')
      .insert({
        repairer_id: user.id,
        content_type: request.content_type,
        source_item_id: request.source_item.id,
        ai_model: aiModel,
        generation_prompt: createPrompt(request),
        generated_content: generatedContent,
        style_used: request.style,
        generation_cost: generationCost,
        quality_score: qualityScore,
        usage_count: 0
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify(savedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur génération IA:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAdTitle(request: GenerationRequest): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) throw new Error('Clé API OpenAI manquante');

  const prompt = createTitlePrompt(request);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un expert en copywriting publicitaire. Génère des titres accrocheurs et efficaces.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.8
    }),
  });

  const data = await response.json();
  const title = data.choices[0].message.content.trim();

  return {
    text: title,
    char_count: title.length,
    estimated_ctr: Math.random() * 0.05 + 0.02 // Simulation
  };
}

async function generateAdDescription(request: GenerationRequest): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) throw new Error('Clé API OpenAI manquante');

  const prompt = createDescriptionPrompt(request);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un expert en copywriting publicitaire. Génère des descriptions convaincantes.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  const description = data.choices[0].message.content.trim();

  return {
    text: description,
    char_count: description.length,
    estimated_engagement: Math.random() * 0.1 + 0.05
  };
}

async function generateImage(request: GenerationRequest): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) throw new Error('Clé API OpenAI manquante');

  const prompt = createImagePrompt(request);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd'
    }),
  });

  const data = await response.json();
  
  return {
    image_url: data.data[0].url,
    format: 'png',
    dimensions: { width: 1024, height: 1024 },
    style: request.style
  };
}

async function generateVideo(request: GenerationRequest): Promise<any> {
  // Simulation de génération vidéo
  return {
    video_url: `https://example.com/generated-video-${Date.now()}.mp4`,
    duration: 15,
    format: 'mp4',
    style: request.style,
    thumbnail_url: `https://example.com/thumbnail-${Date.now()}.jpg`
  };
}

function createPrompt(request: GenerationRequest): string {
  const basePrompt = `Produit: ${request.source_item.name}
Description: ${request.source_item.description || 'Non fournie'}
Prix: ${request.source_item.price ? request.source_item.price + '€' : 'Non spécifié'}
Catégorie: ${request.source_item.category || 'Non spécifiée'}
Style: ${request.style}
Public cible: ${request.target_audience || 'Grand public'}
Contexte: ${request.additional_context || 'Aucun'}`;

  return basePrompt;
}

function createTitlePrompt(request: GenerationRequest): string {
  const stylePrompts = {
    technique: 'Utilise un vocabulaire technique et précis, mets l\'accent sur l\'expertise.',
    proximite: 'Adopte un ton chaleureux et local, emphasise la proximité.',
    urgence: 'Crée un sentiment d\'urgence et d\'efficacité.',
    humour: 'Utilise un ton léger et sympathique avec une pointe d\'humour.',
    premium: 'Adopte un ton haut de gamme et qualitatif.'
  };

  return `${createPrompt(request)}

Crée un titre publicitaire accrocheur de maximum 60 caractères.
Style: ${stylePrompts[request.style]}
Le titre doit être optimisé pour le référencement et inciter au clic.`;
}

function createDescriptionPrompt(request: GenerationRequest): string {
  const stylePrompts = {
    technique: 'Détaille les aspects techniques et l\'expertise.',
    proximite: 'Emphasise le service de proximité et la confiance.',
    urgence: 'Mets l\'accent sur la rapidité et l\'efficacité.',
    humour: 'Utilise un ton décontracté avec une pointe d\'humour.',
    premium: 'Emphasise la qualité premium et l\'excellence.'
  };

  return `${createPrompt(request)}

Crée une description publicitaire de 120-160 caractères.
Style: ${stylePrompts[request.style]}
Include un appel à l'action clair et convaincant.`;
}

function createImagePrompt(request: GenerationRequest): string {
  const styleVisuals = {
    technique: 'technical, professional, detailed tools and equipment',
    proximite: 'warm, friendly, local shop atmosphere',
    urgence: 'dynamic, fast-paced, emergency repair scene',
    humour: 'playful, colorful, cartoon-like elements',
    premium: 'luxury, elegant, high-end materials and finishes'
  };

  return `Professional ${request.source_item.category || 'device'} repair scene, ${styleVisuals[request.style]}, high quality, modern, clean background, product focus on ${request.source_item.name}`;
}

function calculateQualityScore(content: any, request: GenerationRequest): number {
  let score = 75; // Score de base

  // Bonus selon le type de contenu
  if (request.content_type === 'ad_title' && content.char_count <= 60) {
    score += 10;
  }

  if (request.content_type === 'ad_description' && content.char_count >= 120 && content.char_count <= 160) {
    score += 10;
  }

  // Bonus aléatoire pour simulation
  score += Math.random() * 15;

  return Math.min(100, Math.max(0, score));
}