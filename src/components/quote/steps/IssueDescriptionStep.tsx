import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const issueTypes = [
  { value: 'screen', label: 'Écran cassé', icon: '📱' },
  { value: 'battery', label: 'Batterie', icon: '🔋' },
  { value: 'camera', label: 'Caméra', icon: '📷' },
  { value: 'speaker', label: 'Haut-parleur', icon: '🔊' },
  { value: 'charging', label: 'Charge', icon: '⚡' },
  { value: 'other', label: 'Autre', icon: '🔧' },
];

export const IssueDescriptionStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Décrivez le problème</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Plus votre description est précise, plus le devis sera exact
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Type de panne *</Label>
          <RadioGroup
            value={data.issueType}
            onValueChange={(value) => onChange({ issueType: value })}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3"
          >
            {issueTypes.map((type) => (
              <Label
                key={type.value}
                htmlFor={type.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  data.issueType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={type.value} id={type.value} />
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="issueDescription">Description détaillée *</Label>
          <Textarea
            id="issueDescription"
            placeholder="Décrivez le problème en détail (circonstances, symptômes, etc.)"
            value={data.issueDescription || ''}
            onChange={(e) => onChange({ issueDescription: e.target.value })}
            rows={6}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Minimum 20 caractères
          </p>
        </div>
      </div>
    </div>
  );
};
