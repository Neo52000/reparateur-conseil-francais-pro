
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
            city: 'Paris',
            category: 'smartphone',
            source: 'google_maps',
            maxResults: 1
          }
        });
        
        console.log('🧠 Test Mistral:', { data: mistralTest, error: mistralError });
        
        // Vérifier si l'API a fonctionné et n'a pas retourné d'erreur de clé API
        if (!mistralError && mistralTest?.success !== false) {
          setApiKeyStatuses(prev => ({
            ...prev,
            mistral: 'configured'
          }));
        } else if (mistralTest?.error?.includes('clé API') || mistralError?.message?.includes('API')) {
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
            repairersData: [{ name: 'Test Réparateur', address: 'Paris' }], 
            prompt: 'test classification' 
          }
        });

        console.log('⚡ Test DeepSeek:', { data: deepseekTest, error: deepseekError });
        
        // Vérifier si l'API a fonctionné et a classifié des données
        if (!deepseekError && deepseekTest?.classifiedData) {
          setApiKeyStatuses(prev => ({
            ...prev,
            deepseek: 'configured'
          }));
        } else if (deepseekTest?.error?.includes('clé API') || deepseekError?.message?.includes('API')) {
          setApiKeyStatuses(prev => ({
            ...prev,
            deepseek: 'needs_config'
          }));
        }
      } catch (error) {
        console.log('❌ Erreur test DeepSeek:', error);
        setApiKeyStatuses(prev => ({
          ...prev,
          deepseek: 'needs_config'
        }));
      }

      // Test OpenAI via intelligent-scraping (fallback)
      try {
        const { data: openaiTest, error: openaiError } = await supabase.functions.invoke('intelligent-scraping', {
          body: { 
            city: 'Paris',
            category: 'smartphone',
            source: 'test',
            maxResults: 1,
            forceOpenAI: true
          }
        });
        
        console.log('🤖 Test OpenAI:', { data: openaiTest, error: openaiError });
        
        if (!openaiError && openaiTest?.success !== false) {
          setApiKeyStatuses(prev => ({
            ...prev,
            openai: 'configured'
          }));
        }
      } catch (error) {
        console.log('❌ Erreur test OpenAI:', error);
      }

      console.log('✅ Vérification des services IA terminée');
    };

    checkApiKeyAvailability();
  }, []);

  return apiKeyStatuses;
};
