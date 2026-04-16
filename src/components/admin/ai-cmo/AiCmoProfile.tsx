import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, User } from 'lucide-react';
import { AiCmoProfile as AiCmoProfileType, ProfileFormData } from './types';

interface AiCmoProfileProps {
  profile: AiCmoProfileType | null;
  loading: boolean;
  saving: boolean;
  onSave: (data: ProfileFormData) => Promise<void>;
}

const AiCmoProfile: React.FC<AiCmoProfileProps> = ({ profile, loading, saving, onSave }) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    description: '',
    website: '',
    name_aliases: '',
    llm_understanding: '',
    products: '',
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        description: profile.description || '',
        website: profile.website || '',
        name_aliases: Array.isArray(profile.name_aliases) ? profile.name_aliases.join(', ') : '',
        llm_understanding: profile.llm_understanding || '',
        products: profile.products || '',
      });
      setDirty(false);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave(formData);
    setDirty(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profil IA de l'entreprise</h3>
          <p className="text-sm text-muted-foreground">
            Definissez comment les IA conversationnelles doivent percevoir votre marque
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
              Modifications non sauvegardees
            </Badge>
          )}
          <Button onClick={handleSave} disabled={saving || !dirty}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Identite de marque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description de l'entreprise</Label>
            <Textarea
              id="description"
              placeholder="Decrivez votre entreprise, son activite et son positionnement..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.example.com"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_aliases">Alias de nom (separes par des virgules)</Label>
            <Input
              id="name_aliases"
              placeholder="NomMarque, Nom Marque, nom-marque.com"
              value={formData.name_aliases}
              onChange={(e) => handleChange('name_aliases', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Toutes les variantes du nom de votre entreprise que les IA pourraient utiliser
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="llm_understanding">Comprehension actuelle par les IA</Label>
            <Textarea
              id="llm_understanding"
              placeholder="Comment les IA conversationnelles vous decrivent-elles actuellement ?"
              value={formData.llm_understanding}
              onChange={(e) => handleChange('llm_understanding', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Produits et services principaux</Label>
            <Textarea
              id="products"
              placeholder="Listez vos produits et services cles..."
              value={formData.products}
              onChange={(e) => handleChange('products', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiCmoProfile;
