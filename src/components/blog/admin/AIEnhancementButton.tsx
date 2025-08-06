
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIEnhancementButtonProps {
  field: string;
  currentValue: string;
  onEnhanced: (newValue: string) => void;
  content?: string;
  size?: 'sm' | 'default';
  variant?: 'outline' | 'ghost' | 'default';
}

const AIEnhancementButton: React.FC<AIEnhancementButtonProps> = ({
  field,
  currentValue,
  onEnhanced,
  content,
  size = 'sm',
  variant = 'outline'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<'perplexity' | 'openai' | 'mistral'>('perplexity');
  const { toast } = useToast();

  const fieldLabels: Record<string, string> = {
    title: 'titre',
    slug: 'slug', 
    excerpt: 'extrait',
    meta_title: 'titre SEO',
    meta_description: 'description SEO',
    keywords: 'mots-clés',
    content: 'contenu'
  };

  const handleEnhance = async () => {
    if (!currentValue.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord saisir du contenu",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    console.log(`🚀 Starting AI enhancement for field: ${field} with AI: ${selectedAI}`);
    console.log(`📝 Current value preview: ${currentValue.substring(0, 100)}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-blog-content', {
        body: {
          field,
          currentValue,
          content,
          ai_model: selectedAI
        }
      });

      console.log('📡 Supabase response:', data, error);

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Erreur Supabase: ${error.message || 'Communication impossible avec le serveur'}`);
      }

      if (!data) {
        console.error('❌ No data received from function');
        throw new Error('Aucune réponse reçue du serveur');
      }

      if (data?.success) {
        console.log('✅ Enhancement successful:', data.enhanced_value?.substring(0, 100));
        onEnhanced(data.enhanced_value);
        toast({
          title: "Succès ✨",
          description: `${fieldLabels[field]} amélioré avec ${data.ai_model || selectedAI}`,
        });
      } else {
        console.error('❌ Function returned error:', data?.error);
        throw new Error(data?.error || 'Erreur inconnue du serveur');
      }
    } catch (error: any) {
      console.error('💥 Complete error in handleEnhance:', error);
      
      let errorMessage = `Impossible d'améliorer le ${fieldLabels[field]}`;
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Problème de connexion - vérifiez votre connexion internet';
      } else if (error.message?.includes('API')) {
        errorMessage = 'Problème avec l\'API IA - vérifiez les clés API dans les paramètres';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur d'amélioration IA ❌",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedAI} onValueChange={(value: any) => setSelectedAI(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="perplexity">Perplexity</SelectItem>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="mistral">Mistral</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={handleEnhance}
        disabled={isLoading || !currentValue.trim()}
        size={size}
        variant={variant}
        className="gap-1"
        title={`Améliorer le ${fieldLabels[field]} avec l'IA ${selectedAI}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isLoading ? 'IA...' : 'IA'}
      </Button>
    </div>
  );
};

export default AIEnhancementButton;
