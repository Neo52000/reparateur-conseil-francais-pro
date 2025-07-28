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
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite revendiquer la fiche de mon entreprise "${businessName}" sur votre plateforme.\n\nMerci de me contacter pour procéder à la vérification.\n\nCordialement.`);
    window.open(`mailto:contact@irreparable.fr?subject=${subject}&body=${body}`, '_self');
  };
  return (
    <Card className="border-orange-200 bg-orange-50">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="h-6 w-6 text-orange-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900 mb-2">
            Vous êtes le propriétaire de {businessName} ?
          </h3>
          <p className="text-orange-700 text-sm mb-4">
            Revendiquez votre fiche pour accéder aux fonctionnalités professionnelles et améliorer votre visibilité.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleClaimProfile}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Appeler maintenant
            </Button>
            
            <Button 
              onClick={handleEmailContact}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Mail className="h-4 w-4 mr-2" />
              Envoyer un email
            </Button>
          </div>
          
          <div className="flex items-center mt-4 text-sm text-orange-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Vérification gratuite et rapide
          </div>
        </div>
      </div>
    </Card>
  );
};
export default EnhancedClaimBanner;