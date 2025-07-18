interface Symptom {
  id: string;
  name: string;
  keywords: string[];
  category: 'hardware' | 'software' | 'physical' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  followUpQuestions: string[];
}

interface DiagnosticRule {
  symptoms: string[];
  confidence: number;
  diagnosis: string;
  estimatedCost: { min: number; max: number };
  urgency: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  repairTime: string;
}

export class DiagnosticEngine {
  private symptoms: Symptom[] = [
    {
      id: 'broken_screen',
      name: 'Écran cassé',
      keywords: ['écran', 'cassé', 'fissure', 'pété', 'fissuré', 'rayé'],
      category: 'hardware',
      severity: 'medium',
      followUpQuestions: [
        'L\'écran répond-il encore au toucher ?',
        'Voyez-vous des couleurs anormales ?',
        'Y a-t-il des zones noires permanentes ?'
      ]
    },
    {
      id: 'battery_drain',
      name: 'Problème de batterie',
      keywords: ['batterie', 'autonomie', 'décharge', 'charge', 'pourcentage'],
      category: 'hardware',
      severity: 'medium',
      followUpQuestions: [
        'Depuis quand avez-vous ce problème ?',
        'Le téléphone se décharge-t-il rapidement même en veille ?',
        'Avez-vous remarqué une surchauffe ?'
      ]
    },
    {
      id: 'no_power',
      name: 'Ne s\'allume pas',
      keywords: ['allume', 'démarre', 'mort', 'dead', 'rien'],
      category: 'hardware',
      severity: 'high',
      followUpQuestions: [
        'Le voyant de charge s\'allume-t-il quand vous le branchez ?',
        'Avez-vous essayé un autre chargeur ?',
        'Y a-t-il eu une chute ou un contact avec l\'eau ?'
      ]
    },
    {
      id: 'water_damage',
      name: 'Dégât des eaux',
      keywords: ['eau', 'mouillé', 'tombé', 'piscine', 'humidité'],
      category: 'physical',
      severity: 'critical',
      followUpQuestions: [
        'Le téléphone était-il complètement immergé ?',
        'Combien de temps est-il resté dans l\'eau ?',
        'Avez-vous essayé de l\'allumer immédiatement après ?'
      ]
    },
    {
      id: 'slow_performance',
      name: 'Lenteur',
      keywords: ['lent', 'lag', 'freeze', 'planté', 'rame'],
      category: 'performance',
      severity: 'low',
      followUpQuestions: [
        'Le problème survient-il avec toutes les applications ?',
        'Avez-vous redémarré récemment ?',
        'L\'espace de stockage est-il suffisant ?'
      ]
    }
  ];

  private diagnosticRules: DiagnosticRule[] = [
    {
      symptoms: ['broken_screen'],
      confidence: 0.9,
      diagnosis: 'Remplacement d\'écran nécessaire',
      estimatedCost: { min: 80, max: 250 },
      urgency: 'medium',
      recommendedActions: ['Éviter d\'utiliser l\'écran tactile', 'Protéger avec un film'],
      repairTime: '1-2 heures'
    },
    {
      symptoms: ['battery_drain'],
      confidence: 0.85,
      diagnosis: 'Remplacement de batterie recommandé',
      estimatedCost: { min: 50, max: 100 },
      urgency: 'medium',
      recommendedActions: ['Réduire la luminosité', 'Fermer les apps en arrière-plan'],
      repairTime: '30-60 minutes'
    },
    {
      symptoms: ['no_power'],
      confidence: 0.8,
      diagnosis: 'Problème d\'alimentation ou de carte mère',
      estimatedCost: { min: 60, max: 200 },
      urgency: 'high',
      recommendedActions: ['Ne pas forcer l\'allumage', 'Diagnostic approfondi nécessaire'],
      repairTime: '1-3 heures'
    },
    {
      symptoms: ['water_damage'],
      confidence: 0.95,
      diagnosis: 'Dégât des eaux - Intervention urgente',
      estimatedCost: { min: 100, max: 400 },
      urgency: 'high',
      recommendedActions: ['Éteindre immédiatement', 'Ne pas charger', 'Séchage professionnel'],
      repairTime: '2-5 jours'
    },
    {
      symptoms: ['broken_screen', 'no_power'],
      confidence: 0.75,
      diagnosis: 'Écran et alimentation défaillants',
      estimatedCost: { min: 120, max: 350 },
      urgency: 'high',
      recommendedActions: ['Diagnostic complet recommandé'],
      repairTime: '2-4 heures'
    }
  ];

  analyzeSymptoms(userInput: string, previousSymptoms: string[] = []): {
    detectedSymptoms: Symptom[];
    diagnosis: DiagnosticRule | null;
    followUpQuestions: string[];
    confidence: number;
  } {
    const normalizedInput = userInput.toLowerCase();
    const detectedSymptoms: Symptom[] = [];

    // Détecter les symptômes dans l'input utilisateur
    for (const symptom of this.symptoms) {
      if (symptom.keywords.some(keyword => normalizedInput.includes(keyword))) {
        detectedSymptoms.push(symptom);
      }
    }

    // Combiner avec les symptômes précédents
    const allSymptomIds = [
      ...new Set([
        ...detectedSymptoms.map(s => s.id),
        ...previousSymptoms
      ])
    ];

    // Trouver la règle de diagnostic la plus appropriée
    let bestRule: DiagnosticRule | null = null;
    let bestConfidence = 0;

    for (const rule of this.diagnosticRules) {
      const matchingSymptoms = rule.symptoms.filter(s => allSymptomIds.includes(s));
      const confidence = (matchingSymptoms.length / rule.symptoms.length) * rule.confidence;
      
      if (confidence > bestConfidence && confidence > 0.5) {
        bestRule = rule;
        bestConfidence = confidence;
      }
    }

    // Générer des questions de suivi
    const followUpQuestions: string[] = [];
    for (const symptom of detectedSymptoms) {
      followUpQuestions.push(...symptom.followUpQuestions);
    }

    return {
      detectedSymptoms,
      diagnosis: bestRule,
      followUpQuestions: followUpQuestions.slice(0, 3), // Limiter à 3 questions
      confidence: bestConfidence
    };
  }

  generateDiagnosticReport(symptoms: string[], userResponses: Record<string, string>): {
    summary: string;
    recommendations: string[];
    estimatedCost: string;
    urgency: string;
    nextSteps: string[];
  } {
    const analysis = this.analyzeSymptoms('', symptoms);
    
    if (!analysis.diagnosis) {
      return {
        summary: 'Diagnostic nécessitant une expertise technique',
        recommendations: ['Consultation en magasin recommandée'],
        estimatedCost: 'À déterminer',
        urgency: 'À évaluer',
        nextSteps: ['Prendre rendez-vous pour diagnostic']
      };
    }

    const rule = analysis.diagnosis;
    
    return {
      summary: rule.diagnosis,
      recommendations: rule.recommendedActions,
      estimatedCost: `${rule.estimatedCost.min}€ - ${rule.estimatedCost.max}€`,
      urgency: rule.urgency,
      nextSteps: [
        `Temps de réparation estimé: ${rule.repairTime}`,
        'Rechercher un réparateur agréé',
        'Obtenir un devis détaillé'
      ]
    };
  }

  getSmartFollowUp(currentStage: string, symptoms: string[]): {
    question: string;
    suggestedAnswers: string[];
    nextStage: string;
  } {
    const stageQuestions = {
      initial: {
        question: "Pour mieux vous aider, pouvez-vous me décrire précisément le problème ?",
        suggestedAnswers: ["Écran cassé", "Problème de batterie", "Ne s'allume plus", "Autre problème"],
        nextStage: "symptom_analysis"
      },
      symptom_analysis: {
        question: "Depuis quand avez-vous remarqué ce problème ?",
        suggestedAnswers: ["Aujourd'hui", "Cette semaine", "Depuis plusieurs semaines", "Ça fait longtemps"],
        nextStage: "context_gathering"
      },
      context_gathering: {
        question: "Y a-t-il eu un événement particulier ? (chute, contact avec l'eau, etc.)",
        suggestedAnswers: ["Oui, une chute", "Contact avec l'eau", "Rien de particulier", "Je ne sais pas"],
        nextStage: "solution_recommendation"
      },
      solution_recommendation: {
        question: "Souhaitez-vous que je vous trouve des réparateurs près de chez vous ?",
        suggestedAnswers: ["Oui, avec ma localisation", "Oui, je donnerai ma ville", "Pas maintenant", "J'ai déjà un réparateur"],
        nextStage: "location_or_completion"
      }
    };

    return stageQuestions[currentStage as keyof typeof stageQuestions] || stageQuestions.initial;
  }
}

export const diagnosticEngine = new DiagnosticEngine();