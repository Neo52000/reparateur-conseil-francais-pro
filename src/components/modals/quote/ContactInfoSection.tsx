
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactInfoSectionProps {
  clientName: string;
  clientEmail: string;
  onClientNameChange: (value: string) => void;
  onClientEmailChange: (value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  clientName,
  clientEmail,
  onClientNameChange,
  onClientEmailChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="client_name">Nom complet *</Label>
        <Input
          id="client_name"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="client_email">Email *</Label>
        <Input
          id="client_email"
          type="email"
          value={clientEmail}
          onChange={(e) => onClientEmailChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default ContactInfoSection;
