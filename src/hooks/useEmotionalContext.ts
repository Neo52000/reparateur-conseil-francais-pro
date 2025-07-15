import { useState, useCallback } from 'react';

export type EmotionType = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'empathetic';

interface EmotionalState {
  currentEmotion: EmotionType;
  conversationTone: 'friendly' | 'professional' | 'supportive' | 'urgent';
  userSatisfaction: number; // 0-100
  lastInteractionPositive: boolean;
}

export const useEmotionalContext = () => {
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    currentEmotion: 'happy',
    conversationTone: 'friendly',
    userSatisfaction: 80,
    lastInteractionPositive: true
  });

  const analyzeMessageEmotion = useCallback((message: string, metadata?: any): EmotionType => {
    const lowerMessage = message.toLowerCase();
    
    // Mots-clés émotionnels
    const emotionKeywords = {
      concerned: ['problème', 'cassé', 'ne marche pas', 'urgent', 'stress', 'galère'],
      excited: ['super', 'génial', 'parfait', 'merci', 'excellent'],
      empathetic: ['frustrant', 'énervé', 'marre', 'difficile', 'compliqué'],
      thinking: ['comment', 'pourquoi', 'je sais pas', 'hésiter', 'peut-être'],
      happy: ['bonjour', 'merci', 'ça marche', 'd\'accord', 'oui']
    };

    // Analyse basée sur les métadonnées de l'IA
    if (metadata?.emotion) {
      switch (metadata.emotion) {
        case 'empathy': return 'empathetic';
        case 'urgency': return 'concerned';
        case 'joy': return 'excited';
        case 'understanding': return 'thinking';
        default: return 'happy';
      }
    }

    // Analyse par mots-clés
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return emotion as EmotionType;
      }
    }

    return 'neutral';
  }, []);

  const updateEmotionalState = useCallback((
    message: string, 
    messageType: 'user' | 'bot',
    metadata?: any
  ) => {
    if (messageType === 'user') {
      // Analyser l'émotion du message utilisateur
      const detectedEmotion = analyzeMessageEmotion(message, metadata);
      
      // Mettre à jour la satisfaction utilisateur
      const positiveMessages = ['merci', 'super', 'parfait', 'génial', 'excellent'];
      const negativeMessages = ['nul', 'pas bien', 'déçu', 'marre'];
      
      let satisfactionChange = 0;
      if (positiveMessages.some(word => message.toLowerCase().includes(word))) {
        satisfactionChange = 10;
      } else if (negativeMessages.some(word => message.toLowerCase().includes(word))) {
        satisfactionChange = -15;
      }

      setEmotionalState(prev => ({
        ...prev,
        currentEmotion: detectedEmotion,
        userSatisfaction: Math.max(0, Math.min(100, prev.userSatisfaction + satisfactionChange)),
        lastInteractionPositive: satisfactionChange >= 0,
        conversationTone: detectedEmotion === 'concerned' ? 'urgent' : 
                         detectedEmotion === 'empathetic' ? 'supportive' : 'friendly'
      }));
    } else {
      // Pour les messages du bot, adapter l'émotion selon le contexte
      const botEmotion = metadata?.emotion ? analyzeMessageEmotion('', metadata) : 'happy';
      
      setEmotionalState(prev => ({
        ...prev,
        currentEmotion: botEmotion
      }));
    }
  }, [analyzeMessageEmotion]);

  const getThinkingMessage = useCallback((): string => {
    const messages = [
      "Ben réfléchit...",
      "Je cherche la meilleure solution...",
      "Laissez-moi analyser ça...",
      "Je consulte ma base de connaissances...",
      "Un instant, je prépare votre réponse..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const getEmotionalResponse = useCallback((baseResponse: string, context?: any): string => {
    const { currentEmotion, userSatisfaction, conversationTone } = emotionalState;
    
    // Adapter la réponse selon l'état émotionnel
    if (userSatisfaction < 50 && conversationTone === 'supportive') {
      return `Je comprends que ça puisse être frustrant. ${baseResponse}`;
    }
    
    if (currentEmotion === 'excited' && userSatisfaction > 80) {
      return `${baseResponse} 🎉`;
    }

    return baseResponse;
  }, [emotionalState]);

  return {
    emotionalState,
    updateEmotionalState,
    analyzeMessageEmotion,
    getThinkingMessage,
    getEmotionalResponse
  };
};