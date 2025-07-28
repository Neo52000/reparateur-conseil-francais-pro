import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  CheckCircle, 
  Star, 
  Shield, 
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClaimProfileCTAProps {
  profile: RepairerProfile;
  variant?: 'banner' | 'card' | 'minimal';
}

const ClaimProfileCTA: React.FC<ClaimProfileCTAProps> = ({ 
  profile, 
  variant = 'banner' 
}) => {
  const handleClaimProfile = () => {
    window.open('/repairer/auth', '_blank');
  };

  const handleContactUs = () => {
    const subject = `Revendication de fiche - ${profile.business_name}`;
    const body = `Bonjour,\n\nJe souhaite revendiquer la fiche de mon entreprise :\n\nNom de l'entreprise : ${profile.business_name}\nAdresse : ${profile.address}, ${profile.city} ${profile.postal_code}\n\nMerci de me contacter pour les prochaines étapes.\n\nCordialement`;
    
    window.open(`mailto:contact@topreparateurs.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  if (variant === 'minimal') {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-orange-800 font-medium">
              Vous êtes le responsable de <strong>{profile.business_name}</strong> ?
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Revendiquez votre fiche et gérez votre profil professionnel
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleClaimProfile}
            className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Revendiquer
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building className="h-6 w-6 text-orange-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Propriétaire de <span className="text-orange-600">{profile.business_name}</span> ?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Fiche vérifiée et sécurisée
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Gestion des avis clients
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Visibilité améliorée
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building className="h-4 w-4 text-purple-600" />
                  Contrôle total du profil
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleClaimProfile}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Revendiquer ma fiche
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContactUs}
                    className="flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('tel:+33745062162', '_self')}
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-4 w-4" />
                    Appel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner variant
  return (
    <div className="bg-gradient-to-r from-orange-50 via-blue-50 to-orange-50 border border-orange-200 rounded-lg p-6 mt-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Vous êtes le propriétaire de <span className="text-orange-600">{profile.business_name}</span> ?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              Bénéficiez d'une fiche optimisée et de services complémentaires en revendiquant votre fiche.
              <br />
              <strong>Gérez votre profil, vos horaires, vos tarifs et augmentez votre visibilité !</strong>
            </p>
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Fiche vérifiée
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-600" />
                Gestion des avis
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-600" />
                Visibilité Premium
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:gap-2">
          <Button 
            onClick={handleClaimProfile}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Revendiquer ma fiche
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactUs}
              className="text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              Contact email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('tel:+33745062162', '_self')}
              className="text-xs"
            >
              <Phone className="h-3 w-3 mr-1" />
              07 45 06 21 62
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimProfileCTA;