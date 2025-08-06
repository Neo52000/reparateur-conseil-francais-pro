import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGenerationModalProps {
  onContentGenerated: (content: {
    title: string;
    meta_description: string;
    content: string;
    suggested_slug: string;
  }) => void;
  children: React.ReactNode;
}

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  onContentGenerated,
  children
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pageType: 'service',
    topic: '',
    customPrompt: '',
    targetAudience: '',
    seoFocus: ''
  });

  const pageTypes = [
    { value: 'legal', label: 'Page légale' },
    { value: 'service', label: 'Page de service' },
    { value: 'corporate', label: 'Page corporate' },
    { value: 'faq', label: 'FAQ' }
  ];

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier un sujet",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-static-page-content', {
        body: formData
      });

      if (error) {
        console.error('Edge function error:', error);
        
        // Messages plus spécifiques selon le type d'erreur
        if (error.message?.includes('Failed to send a request to the Edge Function')) {
          toast({
            title: "Service en cours de déploiement",
            description: "L'IA est en cours de déploiement. Réessayez dans 2-3 minutes après le prochain build.",
            variant: "destructive"
          });
        } else if (error.message?.includes('Missing API key')) {
          toast({
            title: "Configuration requise",
            description: "Les clés API IA doivent être configurées. Contactez l'administrateur.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur du service IA",
            description: error.message || "Service temporairement indisponible",
            variant: "destructive"
          });
        }
        return;
      }

      if (data?.success) {
        onContentGenerated(data.content);
        setOpen(false);
        toast({
          title: "Contenu généré",
          description: `Page "${data.content.title}" générée avec ${data.metadata?.model_used || 'IA'}`,
        });
        
        // Reset form
        setFormData({
          pageType: 'service',
          topic: '',
          customPrompt: '',
          targetAudience: '',
          seoFocus: ''
        });
      } else {
        throw new Error(data?.error || 'Erreur de génération');
      }
    } catch (error) {
      console.error('Erreur génération IA:', error);
      
      // Gestion globale des erreurs réseau
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        toast({
          title: "Problème de connexion",
          description: "Vérifiez votre connexion et réessayez.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur de génération",
          description: error.message || "Impossible de générer le contenu",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Génération IA de contenu
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageType">Type de page</Label>
              <Select 
                value={formData.pageType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pageType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Sujet principal *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="ex: Conditions générales d'utilisation"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Public cible</Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="ex: Particuliers cherchant un réparateur"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoFocus">Mots-clés SEO</Label>
            <Input
              id="seoFocus"
              value={formData.seoFocus}
              onChange={(e) => setFormData(prev => ({ ...prev, seoFocus: e.target.value }))}
              placeholder="ex: réparation smartphone, service après-vente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">Instructions personnalisées (optionnel)</Label>
            <Textarea
              id="customPrompt"
              value={formData.customPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
              placeholder="Ajoutez des instructions spécifiques pour personnaliser la génération..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationModal;