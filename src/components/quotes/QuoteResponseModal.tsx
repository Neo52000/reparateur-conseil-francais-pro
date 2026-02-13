import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { enhancedToast } from '@/lib/utils/enhancedToast';
import { CheckCircle, XCircle, Send } from 'lucide-react';

interface QuoteResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: {
    id: string;
    device_brand: string;
    device_model: string;
    issue_description: string;
    contact_email: string;
  };
  onSuccess: () => void;
}

export const QuoteResponseModal: React.FC<QuoteResponseModalProps> = ({
  isOpen,
  onClose,
  quote,
  onSuccess,
}) => {
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [repairerNotes, setRepairerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);

  const handleSubmit = async (responseAction: 'accept' | 'reject') => {
    setAction(responseAction);
    setSubmitting(true);

    try {
      const updateData: Record<string, any> = {
        status: responseAction === 'accept' ? 'responded' : 'rejected',
        repairer_notes: repairerNotes || null,
        updated_at: new Date().toISOString(),
      };

      if (responseAction === 'accept') {
        if (!estimatedPrice) {
          enhancedToast.error({ title: 'Prix requis', description: 'Veuillez indiquer un prix estimé' });
          setSubmitting(false);
          return;
        }
        updateData.estimated_price = parseFloat(estimatedPrice);
        updateData.estimated_duration = estimatedDuration || null;
      }

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quote.id);

      if (error) throw error;

      enhancedToast.success({
        title: responseAction === 'accept' ? 'Devis envoyé' : 'Devis refusé',
        description: responseAction === 'accept'
          ? `Votre réponse a été envoyée pour ${quote.device_brand} ${quote.device_model}`
          : 'La demande a été marquée comme refusée',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur réponse devis:', error);
      enhancedToast.error({ title: 'Erreur', description: 'Impossible de soumettre la réponse' });
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Répondre au devis - {quote.device_brand} {quote.device_model}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Description du problème :</p>
            <p className="text-muted-foreground">{quote.issue_description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix estimé (€) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 89.90"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée estimée</Label>
            <Input
              id="duration"
              placeholder="Ex: 1h30, 2 jours..."
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes pour le client</Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires, conditions..."
              value={repairerNotes}
              onChange={(e) => setRepairerNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="destructive"
            onClick={() => handleSubmit('reject')}
            disabled={submitting}
          >
            {submitting && action === 'reject' ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Refuser
          </Button>
          <Button
            onClick={() => handleSubmit('accept')}
            disabled={submitting}
          >
            {submitting && action === 'accept' ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Envoyer le devis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
