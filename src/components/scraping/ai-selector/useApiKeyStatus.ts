
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_API_KEY_STATUSES } from './constants';
import { APIKeyStatus } from './types';

export const useApiKeyStatus = () => {
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, APIKeyStatus>>(DEFAULT_API_KEY_STATUSES);

  useEffect(() => {
    const checkApiKeyAvailability = async () => {
      try {
        // Test DeepSeek API availability
        const { data: deepseekTest, error: deepseekError } = await supabase.functions.invoke('deepseek-classify', {
          body: { 
            repairersData: [{ name: 'test', address: 'test' }], 
            prompt: 'test' 
          }
        });

        // Si pas d'erreur de clé API, alors DeepSeek est configuré
        if (!deepseekError || !deepseekError.message?.includes('API key')) {
          setApiKeyStatuses(prev => ({
            ...prev,
            deepseek: 'configured'
          }));
        }
      } catch (error) {
        console.log('DeepSeek API key check:', error);
        // Garder le statut par défaut si erreur
      }
    };

    checkApiKeyAvailability();
  }, []);

  return apiKeyStatuses;
};
