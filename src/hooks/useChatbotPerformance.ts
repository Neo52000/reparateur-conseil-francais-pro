import { useState, useCallback } from 'react';

interface PerformanceMetrics {
  totalMessages: number;
  successfulResponses: number;
  averageResponseTime: number;
  aiProviderUsage: Record<string, number>;
  fallbackUsage: number;
  errorRate: number;
  lastUpdated: Date;
}

interface MessageMetric {
  timestamp: Date;
  responseTime: number;
  provider: string;
  success: boolean;
  confidence?: number;
}

export const useChatbotPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalMessages: 0,
    successfulResponses: 0,
    averageResponseTime: 0,
    aiProviderUsage: {},
    fallbackUsage: 0,
    errorRate: 0,
    lastUpdated: new Date()
  });

  const [recentMessages, setRecentMessages] = useState<MessageMetric[]>([]);

  const recordMessage = useCallback((metric: Omit<MessageMetric, 'timestamp'>) => {
    const newMetric: MessageMetric = {
      ...metric,
      timestamp: new Date()
    };

    setRecentMessages(prev => {
      // Garder seulement les 100 derniers messages
      const updated = [newMetric, ...prev].slice(0, 100);
      return updated;
    });

    setMetrics(prev => {
      const newTotal = prev.totalMessages + 1;
      const newSuccess = prev.successfulResponses + (metric.success ? 1 : 0);
      
      // Calculer nouvelle moyenne des temps de réponse
      const newAverage = (prev.averageResponseTime * prev.totalMessages + metric.responseTime) / newTotal;
      
      // Mettre à jour l'usage des providers
      const updatedProviderUsage = { ...prev.aiProviderUsage };
      if (metric.provider === 'local_chatbot') {
        // C'est le fallback
      } else {
        updatedProviderUsage[metric.provider] = (updatedProviderUsage[metric.provider] || 0) + 1;
      }
      
      const newFallbackUsage = metric.provider === 'local_chatbot' ? prev.fallbackUsage + 1 : prev.fallbackUsage;
      
      return {
        totalMessages: newTotal,
        successfulResponses: newSuccess,
        averageResponseTime: newAverage,
        aiProviderUsage: updatedProviderUsage,
        fallbackUsage: newFallbackUsage,
        errorRate: ((newTotal - newSuccess) / newTotal) * 100,
        lastUpdated: new Date()
      };
    });
  }, []);

  const getPerformanceInsights = useCallback(() => {
    const totalAiMessages = Object.values(metrics.aiProviderUsage).reduce((sum, count) => sum + count, 0);
    const fallbackPercentage = (metrics.fallbackUsage / metrics.totalMessages) * 100;
    
    return {
      reliability: metrics.errorRate < 5 ? 'excellent' : metrics.errorRate < 15 ? 'good' : 'poor',
      aiAvailability: fallbackPercentage < 20 ? 'high' : fallbackPercentage < 50 ? 'medium' : 'low',
      performance: metrics.averageResponseTime < 1000 ? 'fast' : metrics.averageResponseTime < 3000 ? 'acceptable' : 'slow',
      mostUsedProvider: Object.entries(metrics.aiProviderUsage).reduce(
        (a, b) => (metrics.aiProviderUsage[a[0]] || 0) > (metrics.aiProviderUsage[b[0]] || 0) ? a : b, 
        ['none', 0]
      )[0] || 'none',
      fallbackPercentage: Math.round(fallbackPercentage),
      totalAiMessages,
      recentErrorRate: calculateRecentErrorRate()
    };
  }, [metrics, recentMessages]);

  const calculateRecentErrorRate = useCallback(() => {
    const recentLimit = 20;
    const recent = recentMessages.slice(0, recentLimit);
    if (recent.length === 0) return 0;
    
    const errors = recent.filter(m => !m.success).length;
    return (errors / recent.length) * 100;
  }, [recentMessages]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalMessages: 0,
      successfulResponses: 0,
      averageResponseTime: 0,
      aiProviderUsage: {},
      fallbackUsage: 0,
      errorRate: 0,
      lastUpdated: new Date()
    });
    setRecentMessages([]);
  }, []);

  return {
    metrics,
    recentMessages,
    recordMessage,
    getPerformanceInsights,
    resetMetrics
  };
};