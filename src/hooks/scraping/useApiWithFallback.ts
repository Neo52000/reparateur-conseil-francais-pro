import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { apiManager } from '@/services/scraping/ApiManager';

export const useApiWithFallback = () => {
  const { toast } = useToast();

  const callApiWithFallback = async (
    apiCall: (apiId: string) => Promise<any>,
    options?: { skipApis?: string[] }
  ) => {
    const result = await apiManager.callWithFallback(
      async (apiId: string) => {
        switch (apiId) {
          case 'serper-search':
            return await supabase.functions.invoke('serper-search', {
              body: await apiCall(apiId)
            });
          case 'multi-ai-pipeline':
            return await supabase.functions.invoke('multi-ai-pipeline', {
              body: await apiCall(apiId)
            });
          case 'unified-scraping':
            return await supabase.functions.invoke('unified-scraping', {
              body: await apiCall(apiId)
            });
          case 'apify-scraping':
            return await supabase.functions.invoke('apify-scraping', {
              body: await apiCall(apiId)
            });
          default:
            throw new Error(`API ${apiId} non supportée`);
        }
      },
      options
    );

    if (!result.success) {
      toast({
        title: "Toutes les APIs ont échoué",
        description: result.error,
        variant: "destructive"
      });
    } else if (result.apiUsed !== 'apify-scraping') {
      toast({
        title: "Fallback utilisé",
        description: `Basculement vers ${result.apiUsed}`,
        variant: "default"
      });
    }

    return result;
  };

  return { callApiWithFallback };
};