
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock } from 'lucide-react';

const ContactOptions: React.FC = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite des informations sur les plans d'abonnement pour réparateurs.`
    );
    window.open(`https://wa.me/33745062162?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Contact immédiat</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={handleWhatsApp}
          className="w-full bg-vibrant-orange hover:bg-vibrant-orange-dark text-vibrant-orange-foreground"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          WhatsApp
          <span className="text-sm ml-2 opacity-75">07 45 06 21 62</span>
        </Button>
      </div>

      <div className="bg-electric-blue-light p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Clock className="h-4 w-4 text-electric-blue mr-2" />
          <span className="font-medium text-electric-blue">Horaires d'ouverture</span>
        </div>
        <div className="text-sm text-electric-blue-dark">
          <p>Lundi - Vendredi : 9h - 18h</p>
          <p>Samedi : 9h - 12h</p>
          <p className="mt-2 font-medium">⚡ Réponse WhatsApp 24h/24</p>
        </div>
      </div>
    </div>
  );
};

export default ContactOptions;
