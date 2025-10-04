
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClaimProfileBannerProps {
  businessName: string;
}

const ClaimProfileBanner: React.FC<ClaimProfileBannerProps> = ({ businessName }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-blue-800 font-medium">
            Vous êtes le responsable de <strong>{businessName}</strong> ?
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Bénéficiez de nos services premium à partir de 9,90€/mois et gérez votre profil
          </p>
        </div>
        <Link to="/repairer-plans">
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Revendiquez mon profil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ClaimProfileBanner;
