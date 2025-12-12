import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, Phone, Mail, Building } from 'lucide-react';

interface RepairerClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerName: string;
  repairerId: string;
}

/**
 * Modal pour permettre aux réparateurs de revendiquer leur fiche
 * Modèle inspiré de Doctolib/Google My Business
 */
const RepairerClaimModal: React.FC<RepairerClaimModalProps> = ({
  isOpen,
  onClose,
  repairerName,
  repairerId,
}) => {
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    siret: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implémenter la logique de demande de revendication
      // Pour l'instant, on simule juste le succès
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('success');
      toast({
        title: "Demande envoyée",
        description: "Nous vérifierons votre demande sous 24-48h.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('info');
    setFormData({ email: '', phone: '', siret: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Revendiquer cette fiche
          </DialogTitle>
          <DialogDescription>
            {repairerName}
          </DialogDescription>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Pourquoi revendiquer votre fiche ?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Mettez à jour vos informations (horaires, services, prix)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Répondez aux avis clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Recevez des demandes de devis directement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Améliorez votre visibilité avec un profil Premium</span>
                </li>
              </ul>
            </div>

            <Button onClick={() => setStep('form')} className="w-full">
              C'est mon établissement
            </Button>
            <Button variant="ghost" onClick={resetAndClose} className="w-full">
              Annuler
            </Button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email professionnel
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@votreentreprise.fr"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01 23 45 67 89"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Numéro SIRET (optionnel)
              </Label>
              <Input
                id="siret"
                type="text"
                placeholder="123 456 789 00012"
                value={formData.siret}
                onChange={(e) => setFormData(prev => ({ ...prev, siret: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Le SIRET accélère la vérification de votre établissement
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep('info')} className="flex-1">
                Retour
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Envoi...' : 'Envoyer la demande'}
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">Demande envoyée !</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Notre équipe vérifiera votre demande sous 24-48h.
                Vous recevrez un email de confirmation.
              </p>
            </div>
            <Button onClick={resetAndClose} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RepairerClaimModal;
