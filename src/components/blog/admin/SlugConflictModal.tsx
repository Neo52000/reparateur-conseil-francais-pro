
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface SlugConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug: string;
  onOverwrite: () => void;
  onUseNewSlug: (newSlug: string) => void;
}

const SlugConflictModal: React.FC<SlugConflictModalProps> = ({
  isOpen,
  onClose,
  currentSlug,
  onOverwrite,
  onUseNewSlug
}) => {
  const [newSlug, setNewSlug] = useState('');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateAlternativeSlug = () => {
    const timestamp = Date.now();
    const alternativeSlug = `${currentSlug}-${timestamp}`;
    setNewSlug(alternativeSlug);
  };

  const handleUseNewSlug = () => {
    if (newSlug.trim()) {
      onUseNewSlug(newSlug.trim());
    }
  };

  React.useEffect(() => {
    if (isOpen && !newSlug) {
      generateAlternativeSlug();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Conflit de slug détecté
          </DialogTitle>
          <DialogDescription>
            Un article avec le slug "{currentSlug}" existe déjà. Que souhaitez-vous faire ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Attention :</strong> Écraser l'article existant supprimera définitivement son contenu.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-slug">Ou utiliser un nouveau slug :</Label>
            <Input
              id="new-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="nouveau-slug-article"
            />
            <p className="text-xs text-gray-500">
              L'URL sera : /blog/article/{newSlug}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onOverwrite}
          >
            Écraser l'article existant
          </Button>
          <Button
            onClick={handleUseNewSlug}
            disabled={!newSlug.trim()}
          >
            Utiliser le nouveau slug
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlugConflictModal;
