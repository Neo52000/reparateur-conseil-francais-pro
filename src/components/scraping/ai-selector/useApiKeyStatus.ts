
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_API_KEY_STATUSES } from './constants';
import { APIKeyStatus } from './types';

export const useApiKeyStatus = () => {
  const [apiKeyStatuses, setApiKeyStatuses] = useState<Record<string, APIKeyStatus>>(DEFAULT_API_KEY_STATUSES);

  useEffect(() => {
    const checkApiKeyAvailability = async () => {
      console.log('🔍 Vérification des services IA...');
      
      // Test Mistral AI via intelligent-scraping
      try {
        const { data: mistralTest, error: mistralError } = await supabase.functions.invoke('intelligent-scraping', {
          body: { 
            city: 'test',
            category: 'smartphone',
            source: 'google_maps',
            maxResults: 1
          }
        });
        
        console.log('🧠 Test Mistral:', { data: mistralTest, error: mistralError });
        
        if (!mistralError && mistralTest) {
          setApiKeyStatuses(prev => ({
            ...prev,
            mistral: 'configured'
          }));
        } else {
          setApiKeyStatuses(prev => ({
            ...prev,
            mistral: 'needs_config'
          }));
        }
      } catch (error) {
        console.log('❌ Erreur test Mistral:', error);
        setApiKeyStatuses(prev => ({
          ...prev,
          mistral: 'needs_config'
        }));
      }

      // Test DeepSeek API
      try {
        const { data: deepseekTest, error: deepseekError } = await supabase.functions.invoke('deepseek-classify', {
          body: { 
            repairersData: [{ name: 'test', address: 'test' }], 
            prompt: 'test' 
          }
        });

        console.log('⚡ Test DeepSeek:', { data: deepseekTest, error: deepseekError });
        
        if (!deepseekError && deepseekTest) {
          setApiKeyStatuses(prev => ({
            ...prev,
            deepseek: 'configured'
          }));
        }
      } catch (error) {
        console.log('❌ Erreur test DeepSeek:', error);
      }

      console.log('✅ Vérification des services IA terminée');
    };

    checkApiKeyAvailability();
  }, []);

  return apiKeyStatuses;
};
