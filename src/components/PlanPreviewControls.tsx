import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Settings, Crown, Star, Zap } from 'lucide-react';
import { usePlanPreview } from '@/hooks/usePlanPreview';
import { getTierInfo } from '@/utils/subscriptionTiers';

const PLAN_TIERS = [
  { value: 'free', label: 'Gratuit', icon: null },
  { value: 'basic', label: 'Visibilité', icon: Star },
  { value: 'premium', label: 'Pro', icon: Zap },
  { value: 'enterprise', label: 'Premium', icon: Crown },
];

export const PlanPreviewControls = () => {
  const { 
    isPreviewMode, 
    previewTier, 
    actualTier, 
    activeTier,
    startPreview, 
    stopPreview, 
    canPreview 
  } = usePlanPreview();
  
  const [isExpanded, setIsExpanded] = useState(false);

  if (!canPreview) return null;

  const actualTierInfo = getTierInfo(actualTier);
  const activeTierInfo = getTierInfo(activeTier);

  return (
    <Card className="border-dashed border-2 border-purple-300 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-purple-600" />
            <span>Prévisualisation des Plans</span>
            {isPreviewMode && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Mode Aperçu
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Plan Actuel :</span>
              <div className="flex items-center gap-2 mt-1">
                {actualTierInfo.icon}
                <span className="font-medium">{actualTierInfo.name}</span>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Plan Affiché :</span>
              <div className="flex items-center gap-2 mt-1">
                {activeTierInfo.icon}
                <span className="font-medium">{activeTierInfo.name}</span>
                {isPreviewMode && (
                  <Badge variant="outline" className="text-xs">
                    Aperçu
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {isPreviewMode && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Vous visualisez l'interface du plan <strong>{activeTierInfo.name}</strong>. 
                Les fonctionnalités affichées correspondent à ce plan.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Prévisualiser un plan :
              </label>
              <Select
                value={isPreviewMode ? previewTier || '' : ''}
                onValueChange={(value) => {
                  if (value) {
                    startPreview(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un plan à prévisualiser" />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TIERS.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <SelectItem key={tier.value} value={tier.value}>
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{tier.label}</span>
                          {tier.value === actualTier && (
                            <Badge variant="outline" className="text-xs ml-2">
                              Actuel
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {isPreviewMode && (
              <div className="flex gap-2">
                <Button
                  onClick={stopPreview}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Arrêter l'aperçu
                </Button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Cette fonctionnalité permet de voir l'interface selon différents plans</p>
            <p>• Les données affichées restent celles de votre compte actuel</p>
            <p>• Seuls les admins et comptes de démonstration ont accès à cette fonctionnalité</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};