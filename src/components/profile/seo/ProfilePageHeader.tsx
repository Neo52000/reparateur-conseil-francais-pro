import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Award, Star, CheckCircle } from 'lucide-react';

interface ProfilePageHeaderProps {
  profile: any;
  isPremium: boolean;
  onBack: () => void;
}

const ProfilePageHeader: React.FC<ProfilePageHeaderProps> = ({
  profile,
  isPremium,
  onBack
}) => {
  return (
    <div className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour aux résultats</span>
          </Button>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isPremium && (
              <Badge className="bg-primary text-primary-foreground">
                <CheckCircle className="h-3 w-3 mr-1" />
                Profil vérifié
              </Badge>
            )}
            
            {profile.has_qualirepar_label && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Award className="h-3 w-3 mr-1" />
                QualiRépar
              </Badge>
            )}
            
            {profile.rating && profile.rating >= 4.5 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Top noté
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageHeader;
