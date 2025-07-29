import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      deviceInfo,
      repairerId
    } = await req.json();

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Generating AI quote for:', deviceInfo);

    // Simulation d'analyse IA (en production, utiliser OpenAI/Mistral)
    const mockAnalysis = {
      repairType: determineRepairType(deviceInfo.symptoms),
      estimatedPrice: calculateEstimatedPrice(deviceInfo),
      priceRange: { min: 0, max: 0 },
      estimatedTime: "45-60 minutes",
      difficulty: determineDifficulty(deviceInfo),
      confidence: 0.85,
      reasoning: generateReasoning(deviceInfo),
      partsCost: 0,
      laborCost: 0,
      warranty: "6 mois",
      recommendations: generateRecommendations(deviceInfo),
      alternativeSolutions: generateAlternatives(deviceInfo)
    };

    // Calculer les coûts
    mockAnalysis.partsCost = Math.round(mockAnalysis.estimatedPrice * 0.6);
    mockAnalysis.laborCost = mockAnalysis.estimatedPrice - mockAnalysis.partsCost;
    mockAnalysis.priceRange = {
      min: Math.round(mockAnalysis.estimatedPrice * 0.8),
      max: Math.round(mockAnalysis.estimatedPrice * 1.2)
    };

    // Enregistrer l'analyse dans la base
    await supabase
      .from('ai_quote_analyses')
      .insert({
        device_info: deviceInfo,
        ai_reasoning: mockAnalysis.reasoning,
        confidence_score: mockAnalysis.confidence,
        suggested_price: mockAnalysis.estimatedPrice,
        alternative_solutions: mockAnalysis.alternativeSolutions,
        processing_time_ms: 250,
        ai_model: 'simulation-v1'
      });

    return new Response(
      JSON.stringify(mockAnalysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating AI quote:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function determineRepairType(symptoms: string): string {
  const symptomsLower = symptoms.toLowerCase();
  
  if (symptomsLower.includes('écran') || symptomsLower.includes('cassé') || symptomsLower.includes('fissuré')) {
    return 'Remplacement écran';
  }
  if (symptomsLower.includes('batterie') || symptomsLower.includes('charge')) {
    return 'Remplacement batterie';
  }
  if (symptomsLower.includes('eau') || symptomsLower.includes('liquide')) {
    return 'Réparation dégât des eaux';
  }
  if (symptomsLower.includes('bouton') || symptomsLower.includes('power')) {
    return 'Réparation bouton';
  }
  if (symptomsLower.includes('caméra') || symptomsLower.includes('photo')) {
    return 'Réparation caméra';
  }
  if (symptomsLower.includes('son') || symptomsLower.includes('haut-parleur')) {
    return 'Réparation audio';
  }
  
  return 'Diagnostic et réparation';
}

function calculateEstimatedPrice(deviceInfo: any): number {
  let basePrice = 80; // Prix de base
  
  // Ajustement selon la marque
  if (deviceInfo.brand === 'Apple') basePrice *= 1.5;
  else if (deviceInfo.brand === 'Samsung') basePrice *= 1.3;
  else if (deviceInfo.brand === 'Huawei') basePrice *= 1.2;
  
  // Ajustement selon le type d'appareil
  if (deviceInfo.type === 'Smartphone') basePrice *= 1.0;
  else if (deviceInfo.type === 'Tablette') basePrice *= 1.4;
  else if (deviceInfo.type === 'Ordinateur portable') basePrice *= 2.0;
  
  // Ajustement selon les symptômes
  const symptoms = deviceInfo.symptoms.toLowerCase();
  if (symptoms.includes('écran')) basePrice *= 1.8;
  else if (symptoms.includes('batterie')) basePrice *= 0.7;
  else if (symptoms.includes('eau')) basePrice *= 1.5;
  
  return Math.round(basePrice);
}

function determineDifficulty(deviceInfo: any): string {
  const symptoms = deviceInfo.symptoms.toLowerCase();
  
  if (symptoms.includes('eau') || symptoms.includes('carte mère')) return 'expert';
  if (symptoms.includes('écran') || symptoms.includes('caméra')) return 'medium';
  if (symptoms.includes('batterie') || symptoms.includes('bouton')) return 'easy';
  
  return 'medium';
}

function generateReasoning(deviceInfo: any): string {
  const { brand, model, type, symptoms } = deviceInfo;
  
  return `Analyse basée sur ${brand} ${model} (${type}). Symptômes: "${symptoms}". ` +
         `Prix calculé selon les tarifs du marché local et la complexité de l'intervention. ` +
         `Temps estimé basé sur l'expérience de réparations similaires.`;
}

function generateRecommendations(deviceInfo: any): string[] {
  const recommendations = [];
  const symptoms = deviceInfo.symptoms.toLowerCase();
  
  if (symptoms.includes('écran')) {
    recommendations.push('Vérifier l\'état du tactile avant intervention');
    recommendations.push('Tester la luminosité après réparation');
    recommendations.push('Installation de protection d\'écran recommandée');
  }
  
  if (symptoms.includes('batterie')) {
    recommendations.push('Calibrage de la batterie après remplacement');
    recommendations.push('Vérification du connecteur de charge');
  }
  
  if (symptoms.includes('eau')) {
    recommendations.push('Nettoyage complet requis');
    recommendations.push('Séchage prolongé nécessaire');
    recommendations.push('Test approfondi de tous les composants');
  }
  
  recommendations.push('Sauvegarde des données recommandée avant intervention');
  recommendations.push('Test complet après réparation');
  
  return recommendations;
}

function generateAlternatives(deviceInfo: any): Array<{title: string, price: number, description: string}> {
  const basePrice = calculateEstimatedPrice(deviceInfo);
  
  return [
    {
      title: "Solution économique",
      price: Math.round(basePrice * 0.75),
      description: "Pièce compatible, garantie 3 mois"
    },
    {
      title: "Solution premium", 
      price: Math.round(basePrice * 1.35),
      description: "Pièce d'origine, garantie 12 mois"
    }
  ];
}