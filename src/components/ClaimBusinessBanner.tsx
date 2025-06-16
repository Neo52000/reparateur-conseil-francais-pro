
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClaimBusinessBannerProps {
  businessName: string;
}

const ClaimBusinessBanner: React.FC<ClaimBusinessBannerProps> = ({ businessName }) => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6 mt-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Building className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vous êtes l'heureux propriétaire de <strong>{businessName}</strong> ?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Bénéficiez d'une fiche optimisée & de services complémentaires en revendiquant votre fiche.
              Gérez votre profil, vos horaires, vos tarifs et augmentez votre visibilité !
            </p>
          </div>
        </div>
        <Link to="/repairer-auth">
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm font-semibold whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Revendiquer ma fiche
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ClaimBusinessBanner;
