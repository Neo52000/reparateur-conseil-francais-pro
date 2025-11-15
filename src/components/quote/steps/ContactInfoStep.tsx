import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Phone } from 'lucide-react';

export const ContactInfoStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Comment souhaitez-vous être contacté pour recevoir les devis ?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="contactName">Nom complet *</Label>
          <Input
            id="contactName"
            placeholder="Votre nom"
            value={data.contactName || ''}
            onChange={(e) => onChange({ contactName: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="contactEmail">Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="votre@email.com"
            value={data.contactEmail || ''}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="contactPhone">Téléphone</Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={data.contactPhone || ''}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Mode de contact préféré *</Label>
          <RadioGroup
            value={data.preferredContact || 'email'}
            onValueChange={(value) => onChange({ preferredContact: value })}
            className="flex gap-4 mt-3"
          >
            <Label
              htmlFor="email"
              className={`flex-1 flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                data.preferredContact === 'email' || !data.preferredContact
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="email" id="email" />
              <Mail className="h-5 w-5" />
              <span className="font-medium">Email</span>
            </Label>

            <Label
              htmlFor="phone"
              className={`flex-1 flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                data.preferredContact === 'phone'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value="phone" id="phone" />
              <Phone className="h-5 w-5" />
              <span className="font-medium">Téléphone</span>
            </Label>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
