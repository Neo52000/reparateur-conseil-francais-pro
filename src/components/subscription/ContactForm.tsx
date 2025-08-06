
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  business: string;
  message: string;
  consent: boolean;
}

interface ContactFormProps {
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<ContactFormData>({
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
      // Envoyer le formulaire via Supabase Edge Function
      const { error } = await supabase.functions.invoke('contact-form', {
        body: formData
      });
      
      if (error) throw error;
      
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

  return (
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
  );
};

export default ContactForm;
