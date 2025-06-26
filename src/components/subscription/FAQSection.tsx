
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';

const FAQSection: React.FC = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite des informations sur les plans d'abonnement pour réparateurs.`
    );
    window.open(`https://wa.me/33745062162?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:contact@topreparateurs.fr`;
  };

  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans-section');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
        
        <div className="space-y-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Puis-je changer de plan à tout moment ?</h3>
            <p className="text-gray-600">
              Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. 
              Les changements prennent effet immédiatement et la facturation est ajustée au prorata.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Comment fonctionne la période d'essai ?</h3>
            <p className="text-gray-600">
              Tous nos plans payants incluent une période d'essai gratuite de 14 jours. 
              Aucun engagement, annulation possible à tout moment.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Quels modes de paiement acceptez-vous ?</h3>
            <p className="text-gray-600">
              Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) 
              ainsi que les virements SEPA pour les entreprises.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Puis-je obtenir une facture ?</h3>
            <p className="text-gray-600">
              Oui, une facture est automatiquement générée pour chaque paiement et envoyée par email. 
              Vous pouvez également télécharger vos factures depuis votre espace client.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Une autre question ?</h3>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider ! Contactez-nous pour obtenir des réponses personnalisées.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp - 07 45 06 21 62
              </Button>
              
              <Button onClick={handleEmail} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                contact@topreparateurs.fr
              </Button>
              
              <Button onClick={scrollToPlans} variant="outline">
                Voir les plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
