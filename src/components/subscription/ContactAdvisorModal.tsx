
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, MessageCircle, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactAdvisorModal: React.FC<ContactAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    message: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      toast({
        title: "Consentement requis",
        description: "Veuillez accepter le traitement de vos données personnelles",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Demande envoyée !",
        description: "Un conseiller vous contactera dans les plus brefs délais",
      });
      
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        business: '',
        message: '',
        consent: false
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite des informations sur les plans d'abonnement pour réparateurs. Mon nom: ${formData.name || '[À compléter]'}, Mon entreprise: ${formData.business || '[À compléter]'}`
    );
    window.open(`https://wa.me/33123456789?text=${message}`, '_blank');
  };

  const handlePhoneCall = () => {
    window.open('tel:+33123456789', '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Parler à un conseiller</DialogTitle>
          <DialogDescription>
            Nos experts vous accompagnent gratuitement pour choisir le plan idéal 
            et maximiser votre visibilité sur la plateforme.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact direct */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact immédiat</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={handlePhoneCall}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Appeler maintenant
                <span className="text-sm ml-2 opacity-75">01 23 45 67 89</span>
              </Button>
              
              <Button 
                onClick={handleWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
                <span className="text-sm ml-2 opacity-75">Réponse rapide</span>
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Horaires d'ouverture</span>
              </div>
              <div className="text-sm text-blue-800">
                <p>Lundi - Vendredi : 9h - 18h</p>
                <p>Samedi : 9h - 12h</p>
                <p className="mt-2 font-medium">⚡ Réponse WhatsApp 24h/24</p>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ou laissez vos coordonnées</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Votre nom et prénom"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <Label htmlFor="business">Nom de votre entreprise</Label>
                <Input
                  id="business"
                  value={formData.business}
                  onChange={(e) => setFormData({...formData, business: e.target.value})}
                  placeholder="Votre entreprise"
                />
              </div>

              <div>
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Décrivez votre activité ou vos besoins..."
                  rows={3}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({...formData, consent: checked as boolean})}
                />
                <Label htmlFor="consent" className="text-sm leading-5">
                  J'accepte le traitement de mes données personnelles pour être contacté par un conseiller. 
                  <span className="text-blue-600 underline cursor-pointer ml-1">
                    Politique de confidentialité
                  </span>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Envoi en cours...' : 'Être rappelé gratuitement'}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>🎯 Engagement qualité :</strong> Nos conseillers sont des experts du secteur de la réparation. 
            Ils vous accompagnent gratuitement et sans engagement pour optimiser votre présence sur notre plateforme.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAdvisorModal;
