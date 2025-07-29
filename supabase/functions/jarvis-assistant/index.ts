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
      message,
      repairerId,
      context
    } = await req.json();

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Jarvis processing message:', message);

    // Analyser le type de demande
    const messageType = analyzeMessageType(message);
    let response = '';
    let metadata = {};

    switch (messageType) {
      case 'analytics':
        response = await handleAnalyticsRequest(supabase, repairerId, message);
        metadata = { type: 'analytics', charts: true };
        break;

      case 'pricing':
        response = await handlePricingRequest(message);
        metadata = { type: 'pricing', calculator: true };
        break;

      case 'quote':
        response = await handleQuoteRequest(message);
        metadata = { type: 'quote', action: 'create' };
        break;

      case 'customer':
        response = await handleCustomerRequest(supabase, repairerId, message);
        metadata = { type: 'customer' };
        break;

      case 'inventory':
        response = await handleInventoryRequest(message);
        metadata = { type: 'inventory' };
        break;

      case 'business_advice':
        response = await handleBusinessAdvice(message);
        metadata = { type: 'advice' };
        break;

      default:
        response = await handleGeneralChat(message, context);
        metadata = { type: 'general' };
    }

    return new Response(
      JSON.stringify({ response, metadata }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in Jarvis assistant:', error);
    return new Response(
      JSON.stringify({ 
        response: 'Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?',
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

function analyzeMessageType(message: string): string {
  const messageLower = message.toLowerCase();

  if (messageLower.includes('chiffre') || messageLower.includes('revenus') || 
      messageLower.includes('statistique') || messageLower.includes('analytics') ||
      messageLower.includes('performance')) {
    return 'analytics';
  }

  if (messageLower.includes('prix') || messageLower.includes('tarif') || 
      messageLower.includes('coût') || messageLower.includes('marge')) {
    return 'pricing';
  }

  if (messageLower.includes('devis') || messageLower.includes('quote') ||
      messageLower.includes('estimation')) {
    return 'quote';
  }

  if (messageLower.includes('client') || messageLower.includes('customer') ||
      messageLower.includes('rendez-vous') || messageLower.includes('appointment')) {
    return 'customer';
  }

  if (messageLower.includes('stock') || messageLower.includes('pièce') ||
      messageLower.includes('inventaire') || messageLower.includes('commande')) {
    return 'inventory';
  }

  if (messageLower.includes('conseil') || messageLower.includes('améliorer') ||
      messageLower.includes('optimiser') || messageLower.includes('stratégie')) {
    return 'business_advice';
  }

  return 'general';
}

async function handleAnalyticsRequest(supabase: any, repairerId: string, message: string): Promise<string> {
  try {
    // Simulation de récupération des données analytics
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const analytics = {
      revenue_this_month: 2450,
      revenue_last_month: 2130,
      repairs_count: 28,
      success_rate: 96,
      customer_satisfaction: 4.8,
      avg_repair_time: 42,
      top_repairs: [
        { type: 'Écran iPhone', percentage: 40 },
        { type: 'Batterie Samsung', percentage: 25 },
        { type: 'Charge iPad', percentage: 15 }
      ]
    };

    const growth = ((analytics.revenue_this_month - analytics.revenue_last_month) / analytics.revenue_last_month * 100).toFixed(1);

    return `📊 **Analyse de performance - ${currentDate.toLocaleDateString('fr-FR')}**

**💰 Chiffre d'affaires**
• Ce mois : ${analytics.revenue_this_month}€ (+${growth}%)
• Mois dernier : ${analytics.revenue_last_month}€
• Progression : ${growth > '0' ? '📈' : '📉'} ${growth}%

**🔧 Activité réparations**
• Total ce mois : ${analytics.repairs_count} réparations
• Taux de réussite : ${analytics.success_rate}%
• Temps moyen : ${analytics.avg_repair_time} minutes

**⭐ Satisfaction client**
• Note moyenne : ${analytics.customer_satisfaction}/5
• Recommandations client : Excellente

**🏆 Top réparations**
${analytics.top_repairs.map((r, i) => `${i + 1}. ${r.type} (${r.percentage}%)`).join('\n')}

**💡 Recommandations**
• Votre activité est en croissance de ${growth}%
• Continuez à vous spécialiser dans les écrans iPhone
• Considérez augmenter vos tarifs Samsung (+10%)

Voulez-vous plus de détails sur une métrique spécifique ?`;

  } catch (error) {
    return 'Désolé, je ne peux pas accéder aux données analytics pour le moment.';
  }
}

async function handlePricingRequest(message: string): Promise<string> {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('iphone') || messageLower.includes('apple')) {
    return `💰 **Calculateur de prix - iPhone**

**Écran iPhone**
• iPhone 14/15 : 180-220€
• iPhone 13 : 150-180€
• iPhone 12 : 130-160€
• iPhone 11 : 110-140€

**Batterie iPhone**
• Modèles récents : 80-100€
• Modèles anciens : 60-80€

**🎯 Conseils tarifaires**
• Marge recommandée : 40-60%
• Prix concurrent moyen : -10%
• Ajout express (+24h) : +20€

**📊 Vos prix actuels vs marché**
• Écran iPhone 14 : 180€ (optimal ✅)
• Batterie iPhone 13 : 75€ (peut augmenter +10€)

Voulez-vous un calcul pour un modèle spécifique ?`;
  }

  return `💰 **Assistant Prix**

Pour vous donner un calcul précis, j'ai besoin de :

1. **Type d'appareil** (iPhone, Samsung, etc.)
2. **Type de réparation** (écran, batterie, etc.)
3. **Modèle exact**
4. **Urgence** (standard, express)

**💡 Règles de pricing**
• Coût pièce × 2.5 = Prix minimum
• Prix marché - 10% = Prix compétitif
• Votre expertise = Valeur ajoutée

Donnez-moi ces informations pour un calcul personnalisé !`;
}

async function handleQuoteRequest(message: string): Promise<string> {
  return `📄 **Générateur de devis intelligent**

Je peux vous aider à créer un devis en 30 secondes !

**Option 1 : Devis IA** 🤖
• Décrivez le problème
• L'IA analyse et propose un prix
• Devis prêt à envoyer

**Option 2 : Devis rapide** ⚡
• Modèles prédéfinis
• Personnalisation simple
• Envoi immédiat

**Option 3 : Devis détaillé** 📋
• Diagnostic complet
• Plusieurs options
• Pièces et main d'œuvre séparées

**Exemple de devis express :**
"iPhone 14, écran cassé, urgence normale"
→ Devis : 185€, délai 24h, garantie 6 mois

Quel type de devis souhaitez-vous créer ?`;
}

async function handleCustomerRequest(supabase: any, repairerId: string, message: string): Promise<string> {
  return `👥 **Gestion clients**

**Aujourd'hui :**
• 3 rendez-vous programmés
• 2 devis en attente de réponse
• 1 client à rappeler (Mme Dupont)

**Cette semaine :**
• 15 nouveaux clients
• Taux de conversion : 75%
• Satisfaction moyenne : 4.8/5

**🔔 Actions urgentes :**
• Rappeler M. Martin (devis iPhone 15)
• Confirmer RDV 14h - Mme Leblanc
• Relancer devis Samsung Galaxy

**📞 Clients à contacter :**
1. Mme Dupont - Réparation terminée
2. M. Rousseau - Devis expirant demain
3. Mlle Chen - Suivi satisfaction

**💡 Opportunités :**
• 3 clients avec appareils multiples
• 2 demandes de partenariat professionnel

Voulez-vous que je programme des rappels automatiques ?`;
}

async function handleInventoryRequest(message: string): Promise<string> {
  return `📦 **Gestion des stocks**

**⚠️ Alertes stock faible :**
• Écrans iPhone 13 : 2 restants
• Batteries Samsung S22 : 1 restante
• Coques iPhone 14 : 3 restantes

**📊 Stock actuel :**
• Écrans iPhone : 15 unités
• Batteries diverses : 25 unités
• Outils : Stock complet ✅
• Adhésifs : Stock complet ✅

**🚛 Commandes recommandées :**
• Écrans iPhone 13 x5 (235€)
• Batteries Samsung x10 (180€)
• Coques protection x20 (60€)

**💰 Valeur stock total : 2,450€**

**📈 Rotation des stocks :**
• Écrans iPhone : 2.5 semaines
• Batteries : 3 semaines
• Accessoires : 6 semaines

**💡 Conseil :** Commandez avant jeudi pour livraison lundi.

Voulez-vous que je prépare une commande automatiquement ?`;
}

async function handleBusinessAdvice(message: string): Promise<string> {
  const messageLower = message.toLowerCase();

  if (messageLower.includes('conversion') || messageLower.includes('taux')) {
    return `🎯 **Améliorer votre taux de conversion**

**Analyse actuelle :**
• Taux de conversion : 72%
• Objectif recommandé : 80%

**🔧 Actions pour améliorer :**

**1. Devis plus rapides**
• Réponse sous 2h max
• Templates prêts à l'emploi
• Tarifs transparents

**2. Professionnalisme**
• Photos avant/après
• Explications techniques
• Garanties claires

**3. Urgence créée**
• "Offre valable 48h"
• "Stock limité"
• "Promotion en cours"

**4. Confiance renforcée**
• Avis clients visibles
• Certifications affichées
• Historique réparations

**📊 Impact estimé :**
• +8% conversion = +200€/mois
• ROI : 3 semaines

**💡 Prochaine étape :** Automatiser les relances à J+1 et J+3.

Voulez-vous que je mette en place ces optimisations ?`;
  }

  return `💡 **Conseils business personnalisés**

**🎯 Vos forces :**
• Expertise technique reconnue
• Satisfaction client élevée (4.8/5)
• Délais de réparation courts

**🔧 Axes d'amélioration :**
• Communication digitale
• Upselling des services
• Fidélisation client

**📈 Opportunités identifiées :**
• Services préventifs (+30% CA)
• Partenariats B2B (+15% CA)
• Formation clients (+10% marge)

**🚀 Actions prioritaires :**
1. Programme de fidélité (3 mois ROI)
2. Offres groupées familles
3. Maintenance préventive

**💰 Potentiel de croissance :**
• Court terme : +25% CA
• Moyen terme : +50% CA

Quelle opportunité vous intéresse le plus ?`;
}

async function handleGeneralChat(message: string, context: any): Promise<string> {
  const responses = [
    `Je suis Jarvis, votre assistant IA dédié à votre activité de réparation. Je peux vous aider avec :

🔧 **Technique :**
• Calculs de prix optimaux
• Création de devis intelligents
• Gestion des stocks

📊 **Business :**
• Analyses de performance
• Conseils d'optimisation
• Suivi client

⚡ **Productivité :**
• Automatisation des tâches
• Planning optimisé
• Rappels intelligents

Comment puis-je vous aider aujourd'hui ?`,

    `Excellent ! Votre activité se porte bien. Quelques suggestions pour aujourd'hui :

• Relancer les 2 devis en attente
• Vérifier le stock d'écrans iPhone
• Programmer les rappels clients
• Analyser la satisfaction du mois

Quelle tâche voulez-vous traiter en priorité ?`,

    `En tant que votre assistant IA, je surveille en continu :

📈 **Performance** : Vos indicateurs sont au vert
🎯 **Opportunités** : 3 nouvelles identifiées
⚡ **Urgences** : 1 action requise aujourd'hui

Sur quoi souhaitez-vous vous concentrer ?`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}