import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationContext {
  device_brand?: string;
  device_model?: string;
  problem_type?: string;
  location?: string;
  budget_range?: string;
  urgency?: string;
}

interface ChatAction {
  type: string;
  params: any;
}

interface ChatResponse {
  response: string;
  context: ConversationContext;
  actions?: ChatAction[];
  provider: string;
  model: string;
  latency_ms: number;
}

export const useAIChat = () => {
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const { toast } = useToast();

  const sendMessage = async (message: string): Promise<ChatResponse | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-lovable', {
        body: { message, sessionId }
      });

      if (error) throw error;

      // Handle actions if any
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          if (action.type === 'search_repairers') {
            toast({
              title: "🔍 Recherche en cours",
              description: `Recherche de réparateurs à ${action.params.location}...`
            });
          } else if (action.type === 'request_quote') {
            toast({
              title: "📝 Demande de devis",
              description: "Préparation de votre demande de devis..."
            });
          }
        }
      }

      return data;
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Check for rate limit or payment errors
      if (error.message?.includes('429')) {
        toast({
          variant: "destructive",
          title: "Limite atteinte",
          description: "Trop de requêtes. Réessayez dans quelques instants."
        });
      } else if (error.message?.includes('402')) {
        toast({
          variant: "destructive",
          title: "Service temporairement indisponible",
          description: "Veuillez réessayer plus tard."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Une erreur s'est produite"
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading,
    sessionId
  };
};
