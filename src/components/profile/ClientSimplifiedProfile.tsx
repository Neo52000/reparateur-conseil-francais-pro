
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Phone, 
  Shield,
  Eye,
  Lock,
  Heart,
  Mail
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';
import ClaimBusinessBanner from '@/components/ClaimBusinessBanner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientSimplifiedProfileProps {
  profile: RepairerProfile;
  onCallRepairer: () => void;
}

const ClientSimplifiedProfile: React.FC<ClientSimplifiedProfileProps> = ({
  profile,
  onCallRepairer
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
    <div className="space-y-6">
      {/* Header simplifié */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.business_name}
              </h1>
              <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                <Eye className="h-3 w-3 mr-1" />
                Fiche non revendiquée
              </Badge>
            </div>
          </div>

          {/* Informations visibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Localisation</p>
                    <p className="text-gray-600">{profile.city} ({profile.postal_code})</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-gray-600">{profile.phone}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={onCallRepairer}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Appeler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message d'information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-medium">
                Informations complètes disponibles après revendication
              </p>
            </div>
            <p className="text-blue-600 text-xs mt-1">
              Services détaillés, horaires, avis clients et plus encore...
            </p>
          </div>
        </div>
      </div>

      {/* Actions limitées - Repositionné en 2ème position */}
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

      {/* Sections floutées */}
      <div className="relative">
        <div className="filter blur-sm pointer-events-none select-none">
          <Card className="opacity-60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Services proposés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg p-4 h-24"></div>
                <div className="bg-gray-100 rounded-lg p-4 h-24"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Contenu masqué</p>
            <p className="text-gray-500 text-sm">Revendiquez cette fiche pour voir plus</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="filter blur-sm pointer-events-none select-none">
          <Card className="opacity-60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Horaires d'ouverture</h3>
              <div className="space-y-2">
                <div className="bg-gray-100 rounded h-6"></div>
                <div className="bg-gray-100 rounded h-6"></div>
                <div className="bg-gray-100 rounded h-6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Horaires masqués</p>
            <p className="text-gray-500 text-sm">Appelez pour connaître les horaires</p>
          </div>
        </div>
      </div>

      {/* Banner de revendication */}
      <ClaimBusinessBanner businessName={profile.business_name} />
    </div>
  );
};

export default ClientSimplifiedProfile;
