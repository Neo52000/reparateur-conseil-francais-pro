import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Phone, 
  Mail, 
  CheckCircle, 
  Star,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const benefits = [
    { icon: Star, text: "Profil vérifié et mis en avant" },
    { icon: Calendar, text: "Gérer vos rendez-vous en ligne" },
    { icon: TrendingUp, text: "Recevoir des demandes de devis" },
    { icon: Users, text: "Gérer vos avis clients" }
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/30 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Header style Doctolib */}
        <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">
                Vous êtes le propriétaire de {businessName} ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Revendiquez cette fiche gratuitement en 2 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/repairer/auth" className="flex-1">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                size="lg"
              >
                Revendiquer ma fiche
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleClaimProfile}
              className="border-primary/30 text-primary hover:bg-primary/5"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              07 45 06 21 62
            </Button>
          </div>

          {/* Badge gratuit */}
          <div className="mt-4 flex justify-center">
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
              Gratuit • Sans engagement • Activation immédiate
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedClaimBanner;
