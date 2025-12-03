import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Globe, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScrapedRepairer {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  services?: string[];
  source: string;
}

interface ScrapingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ScrapedRepairer[];
  logId: string;
  onValidated: () => void;
}

const ScrapingPreviewModal: React.FC<ScrapingPreviewModalProps> = ({
  isOpen,
  onClose,
  results,
  logId,
  onValidated,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(results.map((_, idx) => idx))
  );
  const [isValidating, setIsValidating] = useState(false);

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(results.map((_, idx) => idx)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleValidate = async () => {
    if (selectedIds.size === 0) {
      toast.error('Sélectionnez au moins un réparateur');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-scraping', {
        body: {
          log_id: logId,
          selected_ids: Array.from(selectedIds),
          results,
        },
      });

      if (error) throw error;

      toast.success(`${data.items_added} ajoutés, ${data.items_updated} mis à jour`);
      onValidated();
      onClose();
    } catch (error: any) {
      console.error('Erreur validation:', error);
      toast.error(error.message || 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Prévisualisation des résultats ({results.length} réparateurs)
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.size} sélectionné(s)</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Tout désélectionner
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {results.map((repairer, idx) => (
              <div
                key={idx}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedIds.has(idx)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedIds.has(idx)}
                    onCheckedChange={() => toggleSelection(idx)}
                    className="mt-1"
                  />

                  <Avatar className="w-12 h-12">
                    <AvatarImage src={repairer.logo_url} alt={repairer.name} />
                    <AvatarFallback>
                      {repairer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{repairer.name}</h4>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {repairer.address}, {repairer.postal_code} {repairer.city}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      {repairer.phone && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {repairer.phone}
                        </span>
                      )}
                      {repairer.email && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {repairer.email}
                        </span>
                      )}
                      {repairer.website && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <a
                            href={repairer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate max-w-[200px]"
                          >
                            {repairer.website}
                          </a>
                        </span>
                      )}
                    </div>

                    {repairer.latitude && repairer.longitude ? (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                        Géolocalisé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <XCircle className="w-3 h-3 mr-1 text-orange-500" />
                        Non géolocalisé
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleValidate}
            disabled={isValidating || selectedIds.size === 0}
            className="gap-2"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Validation...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Valider {selectedIds.size} réparateur(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScrapingPreviewModal;
