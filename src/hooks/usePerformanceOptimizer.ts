import { useState, useEffect, useCallback } from 'react';
import { performanceOptimizer } from '@/services/performance/PerformanceOptimizer';
import type { PerformanceMetrics, PerformanceConfig } from '@/services/performance/PerformanceOptimizer';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const usePerformanceOptimizer = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const initialize = useCallback(async (config?: Partial<PerformanceConfig>) => {
    if (!user || isInitialized) return false;

    setIsLoading(true);
    try {
      const success = await performanceOptimizer.initialize(user.id, config);
      setIsInitialized(success);
      
      if (success) {
        toast.success('Module de performance initialisé');
      } else {
        toast.error('Accès performance réservé aux plans Premium/Enterprise');
      }
      
      return success;
    } catch (error) {
      console.error('Erreur initialisation performance:', error);
      toast.error('Erreur lors de l\'initialisation');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isInitialized]);

  const fetchMetrics = useCallback(async () => {
    if (!user || !isInitialized) return;

    try {
      const performanceMetrics = await performanceOptimizer.getPerformanceMetrics(user.id);
      setMetrics(performanceMetrics);

      const recs = await performanceOptimizer.getOptimizationRecommendations(user.id);
      setRecommendations(recs);
    } catch (error) {
      console.error('Erreur récupération métriques:', error);
    }
  }, [user, isInitialized]);

  const optimizeImage = useCallback(async (imageFile: File) => {
    if (!user) return null;
    
    try {
      return await performanceOptimizer.optimizeImage(imageFile, user.id);
    } catch (error) {
      console.error('Erreur optimisation image:', error);
      toast.error('Erreur lors de l\'optimisation de l\'image');
      return null;
    }
  }, [user]);

  const preloadFonts = useCallback(async () => {
    if (!user) return;
    
    try {
      await performanceOptimizer.preloadCriticalFonts(user.id);
      toast.success('Polices critiques préchargées');
    } catch (error) {
      console.error('Erreur préchargement polices:', error);
      toast.error('Erreur lors du préchargement des polices');
    }
  }, [user]);

  const runPageSpeedAnalysis = useCallback(async (url: string) => {
    if (!user) return null;
    
    try {
      const result = await performanceOptimizer.runPageSpeedAnalysis(url, user.id);
      toast.success('Analyse PageSpeed terminée');
      return result;
    } catch (error) {
      console.error('Erreur analyse PageSpeed:', error);
      toast.error('Erreur lors de l\'analyse PageSpeed');
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (user && !isInitialized) {
      initialize();
    }
  }, [user, initialize, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isInitialized, fetchMetrics]);

  return {
    metrics,
    recommendations,
    isInitialized,
    isLoading,
    initialize,
    fetchMetrics,
    optimizeImage,
    preloadFonts,
    runPageSpeedAnalysis,
  };
};