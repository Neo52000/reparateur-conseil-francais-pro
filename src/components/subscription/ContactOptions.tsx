
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock } from 'lucide-react';

interface ContactOptionsProps {
  formData: { name: string; business: string };
}

const ContactOptions: React.FC<ContactOptionsProps> = ({ formData }) => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite des informations sur les plans d'abonnement pour réparateurs. Mon nom: ${formData.name || '[À compléter]'}, Mon entreprise: ${formData.business || '[À compléter]'}`
    );
    window.open(`https://wa.me/0745062162?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Contact immédiat</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={handleWhatsApp}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          WhatsApp
          <span className="text-sm ml-2 opacity-75">07 45 06 21 62</span>
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
  );
};

export default ContactOptions;
