interface ChatResponse {
  response: string;
  suggestions: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
  confidence: number;
}

interface KeywordPattern {
  keywords: string[];
  response: string;
  suggestions: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
}

export class FallbackChatbot {
  private patterns: KeywordPattern[] = [
    // Salutations
    {
      keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'hey'],
      response: "Bonjour ! Je suis là pour vous aider avec la réparation de votre smartphone. Comment puis-je vous assister aujourd'hui ?",
      suggestions: ["Demander un devis", "Trouver un réparateur", "Questions fréquentes"],
      actions: [
        { type: 'redirect', label: 'Voir les réparateurs', data: { url: '/repairers' } }
      ]
    },
    
    // Demandes de devis
    {
      keywords: ['devis', 'prix', 'coût', 'tarif', 'combien', 'estimation'],
      response: "Pour obtenir un devis personnalisé, j'ai besoin de quelques informations sur votre appareil. Quelle est la marque et le modèle de votre smartphone ?",
      suggestions: ["iPhone", "Samsung", "Huawei", "Xiaomi", "Autre marque"],
      actions: [
        { type: 'form', label: 'Formulaire de devis', data: { form: 'quote' } }
      ]
    },
    
    // Problèmes courants
    {
      keywords: ['écran', 'cassé', 'fissure', 'noir', 'tactile'],
      response: "Les problèmes d'écran sont très courants. Selon le modèle, le remplacement d'écran coûte généralement entre 50€ et 200€. Voulez-vous trouver un réparateur près de chez vous ?",
      suggestions: ["Trouver un réparateur", "Demander un devis", "Conseils préventifs"],
      actions: [
        { type: 'location', label: 'Réparateurs à proximité' }
      ]
    },
    
    // Batterie
    {
      keywords: ['batterie', 'charge', 'autonomie', 'décharge'],
      response: "Les problèmes de batterie sont fréquents après 2-3 ans d'utilisation. Le changement de batterie coûte généralement entre 30€ et 80€ selon le modèle.",
      suggestions: ["Changer la batterie", "Conseils d'entretien", "Diagnostic gratuit"],
      actions: [
        { type: 'tips', label: 'Conseils batterie' }
      ]
    },
    
    // Recherche de réparateurs
    {
      keywords: ['réparateur', 'proche', 'près', 'magasin', 'atelier'],
      response: "Je peux vous aider à trouver des réparateurs qualifiés près de chez vous. Dans quelle ville vous trouvez-vous ?",
      suggestions: ["Paris", "Lyon", "Marseille", "Toulouse", "Autre ville"],
      actions: [
        { type: 'location', label: 'Géolocalisation' },
        { type: 'redirect', label: 'Carte des réparateurs', data: { url: '/repairers' } }
      ]
    },
    
    // Urgence
    {
      keywords: ['urgent', 'vite', 'rapide', 'immédiat', 'express'],
      response: "Pour une réparation urgente, je recommande nos partenaires avec service express. Ils peuvent généralement intervenir dans les 24h.",
      suggestions: ["Service express", "Réparation à domicile", "Dépannage immédiat"],
      actions: [
        { type: 'urgent', label: 'Service express' }
      ]
    },
    
    // Garantie
    {
      keywords: ['garantie', 'assurance', 'sav', 'remboursement'],
      response: "Tous nos réparateurs partenaires offrent une garantie sur leurs interventions. La durée varie selon le type de réparation (3 à 12 mois).",
      suggestions: ["Conditions de garantie", "Faire jouer la garantie", "SAV"],
      actions: [
        { type: 'info', label: 'Conditions de garantie' }
      ]
    }
  ];

  private defaultResponses = [
    "Je comprends votre question. Pouvez-vous me donner plus de détails ?",
    "Intéressant ! Pouvez-vous préciser votre demande ?",
    "Je vais vous aider. Quel est exactement votre problème ?",
    "D'accord, je vois. Pouvez-vous reformuler votre question ?"
  ];

  analyzeMessage(message: string): ChatResponse {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Recherche de correspondances de mots-clés
    for (const pattern of this.patterns) {
      const matchedKeywords = pattern.keywords.filter(keyword => 
        normalizedMessage.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        return {
          response: pattern.response,
          suggestions: pattern.suggestions,
          actions: pattern.actions,
          confidence: matchedKeywords.length / pattern.keywords.length
        };
      }
    }
    
    // Réponse par défaut si aucune correspondance
    const randomResponse = this.defaultResponses[
      Math.floor(Math.random() * this.defaultResponses.length)
    ];
    
    return {
      response: randomResponse,
      suggestions: ["Demander un devis", "Trouver un réparateur", "Questions fréquentes", "Parler à un conseiller"],
      confidence: 0.5
    };
  }

  getWelcomeMessage(): ChatResponse {
    return {
      response: "Bonjour ! Je suis votre assistant virtuel pour la réparation smartphone. Je peux vous aider à trouver un réparateur, obtenir un devis ou répondre à vos questions. Comment puis-je vous aider ?",
      suggestions: ["Demander un devis", "Trouver un réparateur", "Questions fréquentes"],
      actions: [
        { type: 'redirect', label: 'Voir tous les services', data: { url: '/services' } }
      ],
      confidence: 1.0
    };
  }
}

export const fallbackChatbot = new FallbackChatbot();