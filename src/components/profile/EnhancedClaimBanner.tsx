import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Phone, Mail, CheckCircle } from 'lucide-react';

interface EnhancedClaimBannerProps {
  businessName: string;
}

const EnhancedClaimBanner: React.FC<EnhancedClaimBannerProps> = ({
  businessName
}) => {
  const handleClaimProfile = () => {
    window.open('tel:+33745062162', '_self');
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent(`Revendication de fiche - ${businessName}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite revendiquer la fiche de mon entreprise "${businessName}" sur votre plateforme.\n\nMerci de me contacter pour procéder à la vérification.\n\nCordialement.`
    );
    window.open(`mailto:contact@irreparable.fr?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vous êtes le propriétaire de {businessName} ?
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Revendiquez votre fiche pour débloquer toutes les fonctionnalités : 
            gestion complète de votre profil, photos, horaires détaillés, et bien plus !
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Profil vérifié</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Gestion des horaires</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Photos & services</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleClaimProfile}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              <Phone className="h-4 w-4 mr-2" />
              Appeler pour revendiquer
            </Button>
            
            <Button 
              onClick={handleEmailContact}
              variant="outline"
              size="lg"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contacter par email
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Processus de vérification rapide • Gratuit • Support dédié
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedClaimBanner;