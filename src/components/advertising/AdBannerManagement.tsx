import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Eye, BarChart3, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AdBannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_url: '',
    target_type: 'client' as 'client' | 'repairer',
    is_active: true,
    start_date: '',
    end_date: '',
    max_impressions: '',
    max_clicks: '',
    daily_budget: '',
    targeting_cities: '',
    targeting_postal_codes: '',
    targeting_device_types: '',
    targeting_subscription_tiers: '',
    targeting_global: false
  });

  // Charger les bannières
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Caster le type pour correspondre à notre interface
      const typedBanners = (data || []).map(banner => ({
        ...banner,
        target_type: banner.target_type as 'client' | 'repairer'
      })) as AdBanner[];
      
      setBanners(typedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Erreur lors du chargement des bannières');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Télécharger une image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      toast.error('L\'image doit faire moins de 2MB');
      return;
    }

    try {
      setUploading(true);
      
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Télécharger le fichier
      const { error: uploadError } = await supabase.storage
        .from('ad-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('ad-banners')
        .getPublicUrl(filePath);

      // Mettre à jour le formulaire avec l'URL de l'image
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image téléchargée avec succès');

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une image téléchargée
  const handleRemoveUploadedImage = async () => {
    if (!formData.image_url) return;

    try {
      // Extraire le nom du fichier de l'URL
      const fileName = formData.image_url.split('/').pop();
      if (fileName && formData.image_url.includes('ad-banners')) {
        await supabase.storage
          .from('ad-banners')
          .remove([fileName]);
      }
      
      setFormData(prev => ({ ...prev, image_url: '' }));
      toast.success('Image supprimée');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Erreur lors de la suppression de l\'image');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      target_url: '',
      target_type: 'client',
      is_active: true,
      start_date: '',
      end_date: '',
      max_impressions: '',
      max_clicks: '',
      daily_budget: '',
      targeting_cities: '',
      targeting_postal_codes: '',
      targeting_device_types: '',
      targeting_subscription_tiers: '',
      targeting_global: false
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  // Préparer les données pour la sauvegarde
  const prepareBannerData = () => {
    const targeting_config = {
      cities: formData.targeting_cities ? formData.targeting_cities.split(',').map(s => s.trim()) : [],
      postal_codes: formData.targeting_postal_codes ? formData.targeting_postal_codes.split(',').map(s => s.trim()) : [],
      device_types: formData.targeting_device_types ? formData.targeting_device_types.split(',').map(s => s.trim()) : [],
      subscription_tiers: formData.targeting_subscription_tiers ? formData.targeting_subscription_tiers.split(',').map(s => s.trim()) : [],
      global: formData.targeting_global
    };

    return {
      title: formData.title,
      image_url: formData.image_url,
      target_url: formData.target_url,
      target_type: formData.target_type,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      max_impressions: formData.max_impressions ? parseInt(formData.max_impressions) : null,
      max_clicks: formData.max_clicks ? parseInt(formData.max_clicks) : null,
      daily_budget: formData.daily_budget ? parseFloat(formData.daily_budget) : null,
      targeting_config,
      created_by: user?.id
    };
  };

  // Sauvegarder une bannière
  const saveBanner = async () => {
    try {
      const bannerData = prepareBannerData();

      if (editingBanner) {
        // Mise à jour
        const { error } = await supabase
          .from('ad_banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Bannière mise à jour avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('ad_banners')
          .insert([bannerData]);

        if (error) throw error;
        toast.success('Bannière créée avec succès');
      }

      fetchBanners();
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Éditer une bannière
  const editBanner = (banner: AdBanner) => {
    const targeting = banner.targeting_config as any;
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      target_url: banner.target_url,
      target_type: banner.target_type,
      is_active: banner.is_active,
      start_date: banner.start_date?.split('T')[0] || '',
      end_date: banner.end_date?.split('T')[0] || '',
      max_impressions: banner.max_impressions?.toString() || '',
      max_clicks: banner.max_clicks?.toString() || '',
      daily_budget: banner.daily_budget?.toString() || '',
      targeting_cities: targeting.cities?.join(', ') || '',
      targeting_postal_codes: targeting.postal_codes?.join(', ') || '',
      targeting_device_types: targeting.device_types?.join(', ') || '',
      targeting_subscription_tiers: targeting.subscription_tiers?.join(', ') || '',
      targeting_global: targeting.global || false
    });
    setEditingBanner(banner);
    setShowForm(true);
  };

  // Supprimer une bannière
  const deleteBanner = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) return;

    try {
      const { error } = await supabase
        .from('ad_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Bannière supprimée');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Basculer l'état actif/inactif
  const toggleBannerStatus = async (banner: AdBanner) => {
    try {
      const { error } = await supabase
        .from('ad_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      fetchBanners();
      toast.success(`Bannière ${!banner.is_active ? 'activée' : 'désactivée'}`);
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des bannières publicitaires</h2>
          <p className="text-gray-600">Gérez les bannières affichées sur le site</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle bannière
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la bannière"
                />
              </div>
              <div>
                <Label htmlFor="target_type">Type de cible</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(value: 'client' | 'repairer') => 
                    setFormData(prev => ({ ...prev, target_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Clients</SelectItem>
                    <SelectItem value="repairer">Réparateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section Image avec upload */}
            <div className="space-y-4">
              <Label>Image de la bannière</Label>
              
              {/* Bouton d'upload */}
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Téléchargement...' : 'Choisir une image'}
                </Button>
                
                {/* Champ URL manuel */}
                <div className="flex-1">
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Ou saisissez l'URL de l'image"
                  />
                </div>
              </div>

              {/* Prévisualisation de l'image */}
              {formData.image_url && (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Prévisualisation"
                    className="w-full max-w-md h-24 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={handleRemoveUploadedImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Format recommandé : 728x90px • Max 2MB • Formats acceptés : JPG, PNG, GIF
              </p>
            </div>

            <div>
              <Label htmlFor="target_url">URL de destination</Label>
              <Input
                id="target_url"
                value={formData.target_url}
                onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_impressions">Impressions max</Label>
                <Input
                  id="max_impressions"
                  type="number"
                  value={formData.max_impressions}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_impressions: e.target.value }))}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="max_clicks">Clics max</Label>
                <Input
                  id="max_clicks"
                  type="number"
                  value={formData.max_clicks}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_clicks: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="daily_budget">Budget quotidien (€)</Label>
                <Input
                  id="daily_budget"
                  type="number"
                  step="0.01"
                  value={formData.daily_budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, daily_budget: e.target.value }))}
                  placeholder="50.00"
                />
              </div>
            </div>

            {/* Ciblage */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Configuration du ciblage</h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="targeting_global"
                  checked={formData.targeting_global}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, targeting_global: checked }))
                  }
                />
                <Label htmlFor="targeting_global">Ciblage global (afficher partout)</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targeting_cities">Villes (séparées par des virgules)</Label>
                  <Input
                    id="targeting_cities"
                    value={formData.targeting_cities}
                    onChange={(e) => setFormData(prev => ({ ...prev, targeting_cities: e.target.value }))}
                    placeholder="Paris, Lyon, Marseille"
                    disabled={formData.targeting_global}
                  />
                </div>
                <div>
                  <Label htmlFor="targeting_postal_codes">Codes postaux</Label>
                  <Input
                    id="targeting_postal_codes"
                    value={formData.targeting_postal_codes}
                    onChange={(e) => setFormData(prev => ({ ...prev, targeting_postal_codes: e.target.value }))}
                    placeholder="75001, 69000, 13000"
                    disabled={formData.targeting_global}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targeting_device_types">Types d'appareils</Label>
                  <Input
                    id="targeting_device_types"
                    value={formData.targeting_device_types}
                    onChange={(e) => setFormData(prev => ({ ...prev, targeting_device_types: e.target.value }))}
                    placeholder="smartphone, console, montre"
                    disabled={formData.targeting_global}
                  />
                </div>
                <div>
                  <Label htmlFor="targeting_subscription_tiers">Niveaux d'abonnement</Label>
                  <Input
                    id="targeting_subscription_tiers"
                    value={formData.targeting_subscription_tiers}
                    onChange={(e) => setFormData(prev => ({ ...prev, targeting_subscription_tiers: e.target.value }))}
                    placeholder="free, basic, premium"
                    disabled={formData.targeting_global}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="is_active">Bannière active</Label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={saveBanner}>
                {editingBanner ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des bannières */}
      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-20 h-12 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{banner.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                        {banner.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">
                        {banner.target_type === 'client' ? 'Clients' : 'Réparateurs'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {banner.current_impressions} impressions • {banner.current_clicks} clics
                      {banner.current_impressions > 0 && (
                        <span> • CTR: {((banner.current_clicks / banner.current_impressions) * 100).toFixed(2)}%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBannerStatus(banner)}
                  >
                    {banner.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editBanner(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBanner(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-gray-500">Aucune bannière créée pour le moment.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Créer votre première bannière
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdBannerManagement;
