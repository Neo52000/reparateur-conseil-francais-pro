
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
    try {
      const { data, error } = await supabase.functions.invoke('enhance-blog-content', {
        body: {
          field,
          currentValue,
          content,
          ai_model: selectedAI
        }
      });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(error.message || 'Erreur de communication avec le serveur');
      }

      if (data?.success) {
        onEnhanced(data.enhanced_value);
        toast({
          title: "Succès",
          description: `${fieldLabels[field]} amélioré avec ${data.ai_model || selectedAI}`,
        });
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur amélioration IA:', error);
      toast({
        title: "Erreur d'amélioration IA",
        description: error.message || `Impossible d'améliorer le ${fieldLabels[field]}`,
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
