import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContentAssistantProps {
  fieldLabel: string;
  fieldType: 'short' | 'long'; // short = Input, long = Textarea
  onContentGenerated: (content: string) => void;
  placeholder?: string;
  systemContext?: string;
}

const AIContentAssistant: React.FC<AIContentAssistantProps> = ({
  fieldLabel,
  fieldType,
  onContentGenerated,
  placeholder = "Décrivez ce que vous souhaitez générer...",
  systemContext = "Vous êtes un assistant de rédaction pour un blog professionnel."
}) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requis",
        description: "Veuillez décrire ce que vous souhaitez générer",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-helper', {
        body: {
          prompt: prompt.trim(),
          fieldType,
          fieldLabel,
          systemContext
        }
      });

      if (error) throw error;

      if (data?.content) {
        onContentGenerated(data.content);
        setOpen(false);
        setPrompt('');
        toast({
          title: "✨ Contenu généré",
          description: data.provider 
            ? `Généré avec ${data.provider}` 
            : "Le contenu a été généré avec succès"
        });
      } else {
        throw new Error('Aucun contenu généré');
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer le contenu",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Assistant IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistant IA - {fieldLabel}
          </DialogTitle>
          <DialogDescription>
            Décrivez le contenu que vous souhaitez générer pour ce champ
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Instructions pour l'IA</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              rows={6}
              className="resize-none"
            />
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Exemples de prompts :</strong></p>
            {fieldType === 'short' && (
              <>
                <p>• "Écris un titre accrocheur pour une newsletter de bienvenue"</p>
                <p>• "Crée une description meta SEO pour un blog de réparation"</p>
              </>
            )}
            {fieldType === 'long' && (
              <>
                <p>• "Rédige un message de bienvenue chaleureux et professionnel"</p>
                <p>• "Crée une description détaillée incluant nos valeurs et services"</p>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={generating}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Générer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIContentAssistant;
