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
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              Vous êtes propriétaire de {businessName} ?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Revendiquez cette fiche pour accéder à toutes les fonctionnalités et gérer votre profil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleClaimProfile}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler maintenant
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEmailContact}
                className="border-primary/30 text-primary hover:bg-primary/5"
              >
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un email
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 hidden sm:block">
            <CheckCircle className="h-6 w-6 text-primary/60" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default EnhancedClaimBanner;