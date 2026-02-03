import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProfileWidget, ProfileTheme, evaluateWidgetVisibility } from '@/types/profileBuilder';
import { PlanName } from '@/types/featureFlags';
import { Monitor, Tablet, Smartphone, Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePreviewProps {
  widgets: ProfileWidget[];
  theme: ProfileTheme;
  previewPlan: PlanName;
  onPreviewPlanChange: (plan: PlanName) => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const PLANS: PlanName[] = ['Gratuit', 'Visibilité', 'Pro', 'Premium'];

/**
 * Composant de prévisualisation du profil réparateur
 */
const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  widgets,
  theme,
  previewPlan,
  onPreviewPlanChange,
}) => {
  const [device, setDevice] = React.useState<DeviceType>('desktop');

  const sortedWidgets = [...widgets]
    .filter(w => w.isVisible)
    .sort((a, b) => a.order - b.order);

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[375px]',
  };

  const planColors: Record<PlanName, string> = {
    'Gratuit': 'bg-gray-100 text-gray-800 border-gray-200',
    'Visibilité': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pro': 'bg-purple-100 text-purple-800 border-purple-200',
    'Premium': 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const getVisibilityStats = () => {
    const stats = { visible: 0, blurred: 0, hidden: 0 };
    sortedWidgets.forEach(widget => {
      const state = evaluateWidgetVisibility(widget, previewPlan);
      stats[state]++;
    });
    return stats;
  };

  const stats = getVisibilityStats();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Prévisualisation</CardTitle>
          
          {/* Sélecteur de device */}
          <Tabs value={device} onValueChange={(v) => setDevice(v as DeviceType)}>
            <TabsList className="h-8">
              <TabsTrigger value="desktop" className="px-2">
                <Monitor className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="tablet" className="px-2">
                <Tablet className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="mobile" className="px-2">
                <Smartphone className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sélecteur de plan */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Simuler le plan du réparateur :</p>
          <div className="flex gap-2 flex-wrap">
            {PLANS.map(plan => (
              <Badge
                key={plan}
                variant="outline"
                className={cn(
                  'cursor-pointer transition-all',
                  previewPlan === plan 
                    ? `${planColors[plan]} ring-2 ring-offset-1 ring-primary` 
                    : 'hover:bg-muted'
                )}
                onClick={() => onPreviewPlanChange(plan)}
              >
                {plan}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats de visibilité */}
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <Eye className="h-3 w-3" />
            {stats.visible} visible{stats.visible > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <EyeOff className="h-3 w-3" />
            {stats.blurred} flouté{stats.blurred > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <Lock className="h-3 w-3" />
            {stats.hidden} masqué{stats.hidden > 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        <div 
          className={cn(
            'mx-auto border rounded-lg bg-white shadow-sm overflow-hidden transition-all',
            deviceWidths[device]
          )}
          style={{ fontFamily: theme.fontFamily }}
        >
          {/* Simulation de l'en-tête du profil */}
          <div 
            className="h-24 flex items-end p-4"
            style={{ 
              background: `linear-gradient(135deg, hsl(${theme.primaryColor}) 0%, hsl(${theme.accentColor}) 100%)` 
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-lg font-bold">R</span>
              </div>
              <div className="text-white">
                <p className="font-bold">Réparateur Demo</p>
                <p className="text-sm opacity-80">Plan: {previewPlan}</p>
              </div>
            </div>
          </div>

          {/* Widgets */}
          <div className={cn(
            'p-4',
            theme.spacing === 'compact' && 'space-y-2',
            theme.spacing === 'normal' && 'space-y-4',
            theme.spacing === 'spacious' && 'space-y-6'
          )}>
            {sortedWidgets.map(widget => {
              const state = evaluateWidgetVisibility(widget, previewPlan);
              
              if (state === 'hidden') return null;

              return (
                <div
                  key={widget.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    state === 'blurred' && 'relative overflow-hidden'
                  )}
                >
                  {/* Contenu simulé du widget */}
                  <div className={cn(state === 'blurred' && 'blur-sm')}>
                    <p className="font-medium mb-2">{widget.name}</p>
                    <div className="h-16 bg-muted rounded animate-pulse" />
                  </div>

                  {/* Overlay pour contenu flouté */}
                  {state === 'blurred' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <div className="text-center p-4">
                        <Lock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {widget.visibilityRules.customMessage || 
                            `Passez au plan ${widget.visibilityRules.minPlan} pour voir ce contenu`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {sortedWidgets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun widget à afficher
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePreview;
