
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedProfileActionsProps {
  profile: RepairerProfile;
}

const SimplifiedProfileActions: React.FC<SimplifiedProfileActionsProps> = ({
  profile
}) => {
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInterestSubmit = async () => {
    if (!clientEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre email pour continuer",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('client_interest_requests')
        .insert({
          repairer_profile_id: profile.id,
          client_email: clientEmail,
          client_phone: clientPhone,
          client_message: clientMessage || `Je suis intéressé(e) par vos services de réparation.`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande d'intérêt a été transmise et sera traitée prochainement.",
      });

      setIsInterestModalOpen(false);
      setClientEmail('');
      setClientPhone('');
      setClientMessage('');
    } catch (error: any) {
      console.error('Error submitting interest request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orange-800 font-medium text-sm">
            Fonctionnalités limitées
          </p>
          <p className="text-orange-600 text-xs">
            Devis et prise de RDV disponibles après revendication
          </p>
        </div>
        <Dialog open={isInterestModalOpen} onOpenChange={setIsInterestModalOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Heart className="h-4 w-4 mr-2" />
              Montrer mon intérêt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Informer le réparateur de votre intérêt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Nous informerons {profile.business_name} que vous êtes intéressé(e) par ses services.
              </p>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone (optionnel)</label>
                <Input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message (optionnel)</label>
                <Textarea
                  placeholder="Précisez votre demande..."
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleInterestSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SimplifiedProfileActions;
