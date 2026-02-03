import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileWidget, ProfileTheme, WidgetVisibilityRules } from '@/types/profileBuilder';
import { PlanName } from '@/types/featureFlags';
import { Settings, Eye, EyeOff, Palette, Trash2, Sparkles } from 'lucide-react';

interface ProfilePropertyPanelProps {
  selectedWidget: ProfileWidget | null;
  theme: ProfileTheme;
  onUpdateWidget: (widgetId: string, updates: Partial<ProfileWidget>) => void;
  onUpdateTheme: (updates: Partial<ProfileTheme>) => void;
  onRemoveWidget: (widgetId: string) => void;
  onGenerateAI?: () => void;
}

const PLANS: PlanName[] = ['Gratuit', 'Visibilité', 'Pro', 'Premium'];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Moderne)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Lisible)' },
  { value: 'Poppins', label: 'Poppins (Arrondi)' },
];

const SPACING_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Spacieux' },
];

/**
 * Panneau de propriétés pour les widgets et le thème
 */
const ProfilePropertyPanel: React.FC<ProfilePropertyPanelProps> = ({
  selectedWidget,
  theme,
  onUpdateWidget,
  onUpdateTheme,
  onRemoveWidget,
  onGenerateAI,
}) => {
  const updateVisibilityRules = (updates: Partial<WidgetVisibilityRules>) => {
    if (!selectedWidget) return;
    onUpdateWidget(selectedWidget.id, {
      visibilityRules: { ...selectedWidget.visibilityRules, ...updates },
    });
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {selectedWidget ? 'Propriétés du widget' : 'Thème global'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
        {selectedWidget ? (
          // Propriétés du widget sélectionné
          <>
            {/* Nom du widget */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Widget sélectionné</Label>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-medium">{selectedWidget.name}</p>
                <p className="text-xs text-muted-foreground">{selectedWidget.type}</p>
              </div>
            </div>

            <Separator />

            {/* Visibilité */}
            <div className="space-y-3">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Visibilité
              </Label>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Afficher ce widget</span>
                <Switch
                  checked={selectedWidget.isVisible}
                  onCheckedChange={(checked) => 
                    onUpdateWidget(selectedWidget.id, { isVisible: checked })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Plan minimum requis */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Plan minimum requis</Label>
              <RadioGroup
                value={selectedWidget.visibilityRules.minPlan}
                onValueChange={(value) => updateVisibilityRules({ minPlan: value as PlanName })}
                className="grid grid-cols-2 gap-2"
              >
                {PLANS.map(plan => (
                  <div key={plan} className="flex items-center space-x-2">
                    <RadioGroupItem value={plan} id={`plan-${plan}`} />
                    <Label htmlFor={`plan-${plan}`} className="text-sm cursor-pointer">
                      {plan}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Comportement si non autorisé */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Si plan insuffisant</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <EyeOff className="h-3 w-3" />
                    Flouter le contenu
                  </span>
                  <Switch
                    checked={selectedWidget.visibilityRules.blurIfNotAllowed}
                    onCheckedChange={(checked) => 
                      updateVisibilityRules({ 
                        blurIfNotAllowed: checked,
                        hideIfNotAllowed: checked ? false : selectedWidget.visibilityRules.hideIfNotAllowed,
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Masquer complètement</span>
                  <Switch
                    checked={selectedWidget.visibilityRules.hideIfNotAllowed}
                    onCheckedChange={(checked) => 
                      updateVisibilityRules({ 
                        hideIfNotAllowed: checked,
                        blurIfNotAllowed: checked ? false : selectedWidget.visibilityRules.blurIfNotAllowed,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Message personnalisé */}
            {selectedWidget.visibilityRules.blurIfNotAllowed && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Message d'upgrade</Label>
                <Textarea
                  placeholder="Passez au plan supérieur pour voir ce contenu"
                  value={selectedWidget.visibilityRules.customMessage || ''}
                  onChange={(e) => updateVisibilityRules({ customMessage: e.target.value })}
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
            )}

            <Separator />

            {/* Actions */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => onRemoveWidget(selectedWidget.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ce widget
            </Button>
          </>
        ) : (
          // Thème global
          <>
            <div className="space-y-3">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Palette className="h-3 w-3" />
                Couleurs
              </Label>
              
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Couleur principale (HSL)</Label>
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                    placeholder="217 91% 60%"
                    className="text-sm font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Couleur d'accent (HSL)</Label>
                  <Input
                    value={theme.accentColor}
                    onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                    placeholder="142 76% 36%"
                    className="text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Police */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Police</Label>
              <RadioGroup
                value={theme.fontFamily}
                onValueChange={(value) => onUpdateTheme({ fontFamily: value })}
                className="space-y-2"
              >
                {FONT_OPTIONS.map(font => (
                  <div key={font.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={font.value} id={`font-${font.value}`} />
                    <Label 
                      htmlFor={`font-${font.value}`} 
                      className="text-sm cursor-pointer"
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Espacement */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Espacement</Label>
              <RadioGroup
                value={theme.spacing}
                onValueChange={(value) => onUpdateTheme({ spacing: value as ProfileTheme['spacing'] })}
                className="flex gap-4"
              >
                {SPACING_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`spacing-${option.value}`} />
                    <Label htmlFor={`spacing-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {onGenerateAI && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onGenerateAI}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer avec l'IA
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePropertyPanel;
