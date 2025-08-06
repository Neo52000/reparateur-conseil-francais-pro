
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface PlansHeaderProps {
  showBackButton: boolean;
  currentPlan: string;
  onBackClick: () => void;
}

const PlansHeader: React.FC<PlansHeaderProps> = ({
  showBackButton,
  currentPlan,
  onBackClick
}) => {
  return (
    <div>
      {showBackButton && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Nos plans d'abonnement
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Choisissez le plan qui correspond à vos besoins et à votre budget
        </p>
        
        {currentPlan && currentPlan !== 'free' && (
          <div className="mb-6">
            <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
              Plan actuel : {currentPlan}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansHeader;
