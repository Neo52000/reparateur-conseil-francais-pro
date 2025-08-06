import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EligibilityCheckResult } from '@/types/qualirepar';
import { Recycle, CheckCircle, XCircle } from 'lucide-react';

interface QualiReparEligibilityBannerProps {
  eligibilityResult: EligibilityCheckResult;
  onCreateDossier?: () => void;
}

const QualiReparEligibilityBanner: React.FC<QualiReparEligibilityBannerProps> = ({
  eligibilityResult,
  onCreateDossier
}) => {
  if (!eligibilityResult.isEligible) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">
                Produit non éligible au bonus QualiRépar
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                {eligibilityResult.reason}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Recycle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <h3 className="font-semibold text-emerald-900">
                ✅ Produit éligible au bonus QualiRépar !
              </h3>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                Jusqu'à {eligibilityResult.maxBonusAmount}€ de bonus
              </Badge>
              <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                {eligibilityResult.ecoOrganism}
              </Badge>
            </div>
            
            <p className="text-sm text-emerald-700">
              Cette réparation peut bénéficier du bonus QualiRépar. Créez automatiquement 
              votre dossier de demande de remboursement.
            </p>
          </div>
          
          {onCreateDossier && (
            <Button 
              onClick={onCreateDossier}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Recycle className="h-4 w-4 mr-2" />
              Créer le dossier
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QualiReparEligibilityBanner;