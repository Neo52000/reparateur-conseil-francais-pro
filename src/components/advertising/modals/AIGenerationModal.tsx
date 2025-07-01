
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2 } from 'lucide-react';
import { AIGenerationRequest, CreateCreativeData } from '@/types/creatives';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (request: AIGenerationRequest) => Promise<CreateCreativeData>;
}

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [formData, setFormData] = useState<AIGenerationRequest>({
    type: 'image',
    prompt: '',
    style: 'moderne',
    dimensions: { width: 1200, height: 630 },
  });
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt) return;

    setGenerating(true);
    try {
      await onGenerate(formData);
      setFormData({
        type: 'image',
        prompt: '',
        style: 'moderne',
        dimensions: { width: 1200, height: 630 },
      });
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const presetPrompts = [
    "Bannière publicitaire moderne pour réparation smartphone avec couleurs vives",
    "Affiche promotionnelle élégante pour service de réparation premium",
    "Design minimaliste pour campagne publicitaire tech",
    "Créatif coloré et jeune pour réparation mobile",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Générer un créatif avec l'IA
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Type de créatif</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'image' | 'video' | 'text') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="video" disabled>Vidéo (bientôt disponible)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Description du créatif *</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Décrivez le créatif que vous souhaitez générer..."
              rows={4}
              required
            />
            
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Suggestions :</Label>
              <div className="grid grid-cols-1 gap-2">
                {presetPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-left justify-start h-auto p-2 text-xs"
                    onClick={() => setFormData(prev => ({ ...prev, prompt }))}
                  >
                    <Wand2 className="h-3 w-3 mr-2 flex-shrink-0" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {formData.type === 'image' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderne">Moderne</SelectItem>
                    <SelectItem value="minimaliste">Minimaliste</SelectItem>
                    <SelectItem value="coloré">Coloré</SelectItem>
                    <SelectItem value="professionnel">Professionnel</SelectItem>
                    <SelectItem value="créatif">Créatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Largeur (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.dimensions?.width || 1200}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions!, width: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Hauteur (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.dimensions?.height || 630}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions!, height: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, dimensions: { width: 1200, height: 630 } }))}
                >
                  Social (1200×630)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, dimensions: { width: 728, height: 90 } }))}
                >
                  Bannière (728×90)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, dimensions: { width: 300, height: 600 } }))}
                >
                  Mobile (300×600)
                </Button>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={generating || !formData.prompt}>
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer le créatif
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationModal;
