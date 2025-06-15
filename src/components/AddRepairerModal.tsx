
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddRepairerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REPAIR_TYPES = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'montre', label: 'Montre' },
  { value: 'console', label: 'Console' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'autres', label: 'Autres' }
];

const SUBSCRIPTION_TIERS = [
  { value: 'free', label: 'Gratuit' },
  { value: 'basic', label: 'Basique' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' }
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
    siret_number: '',
    description: '',
    website: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    has_qualirepar_label: false,
    repair_types: [] as string[],
    subscription_tier: 'free',
    subscribed: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simuler l'ajout d'un nouveau réparateur
      console.log('Adding new repairer:', formData);
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        siret_number: '',
        description: '',
        website: '',
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        twitter_url: '',
        has_qualirepar_label: false,
        repair_types: [],
        subscription_tier: 'free',
        subscribed: true
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

  const handleRepairTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        repair_types: [...prev.repair_types, type]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        repair_types: prev.repair_types.filter(t => t !== type)
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
              <Label htmlFor="business_name">Nom commercial *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
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
              <Label htmlFor="siret_number">N° SIRET</Label>
              <Input
                id="siret_number"
                value={formData.siret_number}
                onChange={(e) => setFormData(prev => ({ ...prev, siret_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
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
              <Label htmlFor="subscription_tier">Type d'abonnement</Label>
              <Select value={formData.subscription_tier} onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_tier: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Décrivez l'activité du réparateur..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Réseaux sociaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_url">Twitter</Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Types de réparations proposées</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {REPAIR_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`new-${type.value}`}
                    checked={formData.repair_types.includes(type.value)}
                    onCheckedChange={(checked) => handleRepairTypeChange(type.value, checked as boolean)}
                  />
                  <Label htmlFor={`new-${type.value}`}>{type.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_qualirepar_label"
                checked={formData.has_qualirepar_label}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_qualirepar_label: checked as boolean }))}
              />
              <Label htmlFor="has_qualirepar_label">Possède le label QualiRépar</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="subscribed"
                checked={formData.subscribed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, subscribed: checked as boolean }))}
              />
              <Label htmlFor="subscribed">Abonnement actif</Label>
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
