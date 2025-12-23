import React from 'react';
import { Button } from '@/components/ui/button';
import { Building, CheckCircle, Star, Shield, ExternalLink } from 'lucide-react';

interface ProfileClaimBannerProps {
  profile: any;
  onClaimProfile: () => void;
}

const ProfileClaimBanner: React.FC<ProfileClaimBannerProps> = ({ profile, onClaimProfile }) => {
  return (
    <div className="mt-8 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              Vous êtes <span className="text-orange-600">{profile.business_name}</span> ?
            </h3>
            <p className="text-muted-foreground text-sm">
              Revendiquez votre fiche pour gérer vos informations, tarifs et recevoir des demandes de devis.
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-600" />Fiche vérifiée</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-600" />Gestion avis</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-primary" />Visibilité +</span>
            </div>
          </div>
        </div>
        <Button onClick={onClaimProfile} className="bg-orange-600 hover:bg-orange-700 text-white">
          <ExternalLink className="h-4 w-4 mr-2" />
          Revendiquer ma fiche
        </Button>
      </div>
    </div>
  );
};

export default ProfileClaimBanner;
