
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RepairerProfile } from '@/types/repairerProfile';
import AddressAutocompleteInput from '@/components/AddressAutocompleteInput';

interface ContactInfoSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ formData, setFormData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Adresse *</Label>
        <AddressAutocompleteInput
          value={formData.address}
          required
          onChange={({ address, city, postal_code, lat, lng, department_code }) => {
            console.log('Updating form data with address info:', {
              address, city, postal_code, lat, lng, department_code
            });
            
            setFormData(prev => ({
              ...prev,
              address: address,
              city: city || prev.city,
              postal_code: postal_code || prev.postal_code,
              // Stocker les coordonnées pour la géolocalisation
              ...(lat && lng && { 
                geo_lat: lat, 
                geo_lng: lng 
              }),
              // Calculer le département à partir du code postal si disponible
              ...(department_code && { department: department_code })
            }));
          }}
          placeholder="ex : 10 rue de Paris, Lyon"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Ville *</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="postal_code">Code postal *</Label>
        <Input
          id="postal_code"
          value={formData.postal_code}
          onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Site web</Label>
        <Input
          id="website"
          type="url"
          value={formData.website || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://"
        />
      </div>
    </div>
  );
};

export default ContactInfoSection;
