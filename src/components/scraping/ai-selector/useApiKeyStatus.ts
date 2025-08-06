
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_API_KEY_STATUSES } from './constants';
import { APIKeyStatus } from './types';

export const useApiKeyStatus = () => {
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, APIKeyStatus>>(DEFAULT_API_KEY_STATUSES);

  useEffect(() => {
    const checkApiKeyAvailability = async () => {
      console.log('🔍 Vérification des services IA...');
      
      try {
        // Utiliser la nouvelle fonction get-ai-status qui vérifie juste la présence des clés
        const { data, error } = await supabase.functions.invoke('get-ai-status');

        if (error) {
          console.error('❌ Error checking AI status:', error);
          setApiKeyStatuses({
            mistral: 'needs_config',
            deepseek: 'needs_config',
            openai: 'needs_config'
          });
          return;
        }

        if (data?.success && data?.statuses) {
          setApiKeyStatuses(data.statuses);
          console.log('✅ AI services status updated:', data.statuses);
        } else {
          // Fallback en cas de problème
          setApiKeyStatuses({
            mistral: 'needs_config',
            deepseek: 'needs_config',
            openai: 'needs_config'
          });
        }

      } catch (error) {
        console.error('❌ Error checking API availability:', error);
        setApiKeyStatuses({
          mistral: 'needs_config',
          deepseek: 'needs_config',
          openai: 'needs_config'
        });
      }
    };

    checkApiKeyAvailability();
  }, []);

  return apiKeyStatuses;
};
