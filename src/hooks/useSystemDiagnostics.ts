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
      
      // Tester ai-router
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
      
      const systemStatus: SystemStatus = {
        aiRouter: routerError ? 'offline' : 'operational',
        openai: statusData?.statuses?.openai === 'available' ? 'operational' : 'offline',
        mistral: statusData?.statuses?.mistral === 'available' ? 'operational' : 'offline',
        deepseek: statusData?.statuses?.deepseek === 'available' ? 'operational' : 'offline',
        fallback: 'operational',
        lastChecked: new Date()
      };
      
      // Recommander le mode optimal
      let recommendedMode: 'ai' | 'hybrid' | 'fallback' = 'fallback';
      
      if (systemStatus.aiRouter === 'operational' && 
          (systemStatus.openai === 'operational' || 
           systemStatus.mistral === 'operational' || 
           systemStatus.deepseek === 'operational')) {
        recommendedMode = connectionQuality === 'good' ? 'ai' : 'hybrid';
      } else if (systemStatus.aiRouter === 'operational') {
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
        connectionQuality
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