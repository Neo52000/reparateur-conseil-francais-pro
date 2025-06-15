import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddressAutocompleteInput from "./AddressAutocompleteInput";

interface AddRepairerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REPAIR_TYPES = [
  { value: 'Réparation téléphone', label: 'Téléphone' },
  { value: 'Réparation montre', label: 'Montre' },
  { value: 'Réparation console', label: 'Console' },
  { value: 'Réparation ordinateur', label: 'Ordinateur' },
  { value: 'Autres réparations', label: 'Autres' }
];

const AddRepairerModal: React.FC<AddRepairerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    department: '',
    region: '',
    website: '',
    services: [] as string[],
    specialties: [] as string[],
    price_range: 'medium' as 'low' | 'medium' | 'high',
    response_time: '24h',
    is_verified: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Adding new repairer to database:', formData);
      
      // Insérer le nouveau réparateur dans la base de données
      const { data, error } = await supabase
        .from('repairers')
        .insert([{
          name: formData.business_name,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          department: formData.department || formData.postal_code.substring(0, 2),
          region: formData.region || 'France',
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          services: formData.services,
          specialties: formData.specialties,
          price_range: formData.price_range,
          response_time: formData.response_time,
          is_verified: formData.is_verified,
          source: 'manual',
          // Coordonnées par défaut (Paris) - en production, vous pourriez utiliser une API de géocodage
          lat: 48.8566,
          lng: 2.3522,
          rating: 4.5,
          review_count: 0
        }])
        .select();

      if (error) {
        throw error;
      }

      console.log('Repairer added successfully:', data);
      
      toast({
        title: "Succès",
        description: "Nouveau réparateur ajouté avec succès",
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        business_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        department: '',
        region: '',
        website: '',
        services: [],
        specialties: [],
        price_range: 'medium',
        response_time: '24h',
        is_verified: true
      });
      
    } catch (error) {
      console.error('Error adding repairer:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le réparateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s !== service)
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau réparateur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nom du réparateur *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <AddressAutocompleteInput
                value={formData.address}
                required
                onChange={({ address, city, postal_code }) => {
                  setFormData(prev => ({
                    ...prev,
                    address: address,
                    // Si la ville/code postal sont aussi detectés, auto-rempli :
                    city: city || prev.city,
                    postal_code: postal_code || prev.postal_code
                  }));
                }}
                placeholder="ex: 10 rue de Paris, Lyon"
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
              <Label htmlFor="price_range">Gamme de prix</Label>
              <Select value={formData.price_range} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, price_range: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">€ (Économique)</SelectItem>
                  <SelectItem value="medium">€€ (Moyen)</SelectItem>
                  <SelectItem value="high">€€€ (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_time">Délai de réponse</Label>
              <Select value={formData.response_time} onValueChange={(value) => setFormData(prev => ({ ...prev, response_time: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2h">2h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="48h">48h</SelectItem>
                  <SelectItem value="72h">72h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Services proposés</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {REPAIR_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${type.value}`}
                    checked={formData.services.includes(type.value)}
                    onCheckedChange={(checked) => handleServiceChange(type.value, checked as boolean)}
                  />
                  <Label htmlFor={`service-${type.value}`}>{type.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_verified: checked as boolean }))}
              />
              <Label htmlFor="is_verified">Réparateur vérifié</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter le réparateur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRepairerModal;
