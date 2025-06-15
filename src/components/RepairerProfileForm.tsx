
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RepairerProfile {
  id: string;
  user_id: string;
  business_name: string;
  siret_number: string | null;
  description: string | null;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  has_qualirepar_label: boolean;
  repair_types: string[];
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface RepairerProfileFormProps {
  profile: RepairerProfile;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  isAdmin?: boolean;
}

const REPAIR_TYPES = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'montre', label: 'Montre' },
  { value: 'console', label: 'Console' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'autres', label: 'Autres' }
];

const RepairerProfileForm: React.FC<RepairerProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
  isAdmin = false
}) => {
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérifier si c'est un profil mocké (ID commence par "mock-")
      const isMockProfile = profile.id.startsWith('mock-');
      
      if (isMockProfile) {
        // Pour les profils mockés, simuler la sauvegarde
        console.log('Simulating save for mock profile:', formData);
        
        // Simuler un délai de sauvegarde
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Créer un profil mis à jour avec les nouvelles données
        const updatedProfile = {
          ...formData,
          updated_at: new Date().toISOString()
        };
        
        onSave(updatedProfile);
        
        toast({
          title: "Succès",
          description: "Profil de test mis à jour (simulation)",
        });
      } else {
        // Pour les vrais profils, utiliser Supabase
        const { data, error } = await supabase
          .from('repairer_profiles')
          .update({
            business_name: formData.business_name,
            siret_number: formData.siret_number || null,
            description: formData.description || null,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            phone: formData.phone,
            email: formData.email,
            website: formData.website || null,
            facebook_url: formData.facebook_url || null,
            instagram_url: formData.instagram_url || null,
            linkedin_url: formData.linkedin_url || null,
            twitter_url: formData.twitter_url || null,
            has_qualirepar_label: formData.has_qualirepar_label,
            repair_types: formData.repair_types,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
          .select()
          .single();

        if (error) throw error;

        onSave(data);
        
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
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
          <Label htmlFor="siret_number">N° SIRET</Label>
          <Input
            id="siret_number"
            value={formData.siret_number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, siret_number: e.target.value }))}
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder="Décrivez votre activité, vos spécialités..."
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Réseaux sociaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebook_url">Facebook</Label>
            <Input
              id="facebook_url"
              value={formData.facebook_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram</Label>
            <Input
              id="instagram_url"
              value={formData.instagram_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn</Label>
            <Input
              id="linkedin_url"
              value={formData.linkedin_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
              placeholder="https://linkedin.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_url">Twitter</Label>
            <Input
              id="twitter_url"
              value={formData.twitter_url || ''}
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
                id={type.value}
                checked={formData.repair_types.includes(type.value)}
                onCheckedChange={(checked) => handleRepairTypeChange(type.value, checked as boolean)}
              />
              <Label htmlFor={type.value}>{type.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="has_qualirepar_label"
          checked={formData.has_qualirepar_label}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_qualirepar_label: checked as boolean }))}
        />
        <Label htmlFor="has_qualirepar_label">Possède le label QualiRépar</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default RepairerProfileForm;
