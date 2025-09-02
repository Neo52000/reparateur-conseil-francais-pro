import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  aiRouter: 'operational' | 'degraded' | 'offline';
  openai: 'operational' | 'degraded' | 'offline';
  mistral: 'operational' | 'degraded' | 'offline';
  deepseek: 'operational' | 'degraded' | 'offline';
  fallback: 'operational' | 'offline';
  lastChecked: Date;
}

interface DiagnosticInfo {
  systemStatus: SystemStatus;
  isOnline: boolean;
  connectionQuality: 'good' | 'fair' | 'poor';
  recommendedMode: 'ai' | 'hybrid' | 'fallback';
}

export const useSystemDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    systemStatus: {
      aiRouter: 'offline',
      openai: 'offline',
      mistral: 'offline',
      deepseek: 'offline',
      fallback: 'operational',
      lastChecked: new Date()
    },
    isOnline: navigator.onLine,
    connectionQuality: 'good',
    recommendedMode: 'fallback'
  });

  const checkSystemHealth = async () => {
    console.log('🔍 Vérification de l\'état du système...');
    
    try {
      // Test de connectivité basique
      const startTime = Date.now();
      
      // Tester ai-router avec health check
      const { data: routerData, error: routerError } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'health_check'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      // Déterminer la qualité de connexion
      const connectionQuality = responseTime < 1000 ? 'good' : responseTime < 3000 ? 'fair' : 'poor';
      
      // Vérifier le statut des services AI
      const { data: statusData } = await supabase.functions.invoke('get-ai-status');
      
      // Router health based on both response and content
      const routerHealthy = !routerError && routerData?.status === 'healthy';
      
      const systemStatus: SystemStatus = {
        aiRouter: routerHealthy ? 'operational' : 'offline',
        openai: statusData?.statuses?.openai === 'operational' ? 'operational' : 'offline',
        mistral: statusData?.statuses?.mistral === 'operational' ? 'operational' : 'offline',
        deepseek: statusData?.statuses?.deepseek === 'operational' ? 'operational' : 'offline',
        fallback: 'operational',
        lastChecked: new Date()
      };
      
      // Recommander le mode optimal basé sur les services disponibles
      let recommendedMode: 'ai' | 'hybrid' | 'fallback' = 'fallback';
      
      const aiServicesAvailable = statusData?.summary?.configured > 0;
      
      if (routerHealthy && aiServicesAvailable) {
        recommendedMode = connectionQuality === 'good' ? 'ai' : 'hybrid';
      } else if (routerHealthy) {
        recommendedMode = 'hybrid';
      }
      
      setDiagnostics({
        systemStatus,
        isOnline: navigator.onLine,
        connectionQuality,
        recommendedMode
      });
      
      console.log('✅ Diagnostic système terminé:', {
        aiRouter: systemStatus.aiRouter,
        services: `OpenAI: ${systemStatus.openai}, Mistral: ${systemStatus.mistral}, DeepSeek: ${systemStatus.deepseek}`,
        mode: recommendedMode,
        connectionQuality,
        responseTime: `${responseTime}ms`,
        aiProviders: statusData?.summary?.configured || 0
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic système:', error);
      
      setDiagnostics(prev => ({
        ...prev,
        systemStatus: {
          ...prev.systemStatus,
          aiRouter: 'offline',
          openai: 'offline',
          mistral: 'offline',
          deepseek: 'offline',
          fallback: 'operational',
          lastChecked: new Date()
        },
        recommendedMode: 'fallback'
      }));
    }
  };

  useEffect(() => {
    // Vérification initiale
    checkSystemHealth();
    
    // Vérification périodique toutes les 2 minutes
    const interval = setInterval(checkSystemHealth, 120000);
    
    // Écouter les changements de connectivité
    const handleOnline = () => {
      setDiagnostics(prev => ({ ...prev, isOnline: true }));
      checkSystemHealth();
    };
    
    const handleOffline = () => {
      setDiagnostics(prev => ({ 
        ...prev, 
        isOnline: false,
        recommendedMode: 'fallback'
      }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    diagnostics,
    checkSystemHealth,
    isHealthy: diagnostics.systemStatus.aiRouter === 'operational',
    canUseAI: diagnostics.recommendedMode === 'ai',
    shouldUseFallback: diagnostics.recommendedMode === 'fallback'
  };
};