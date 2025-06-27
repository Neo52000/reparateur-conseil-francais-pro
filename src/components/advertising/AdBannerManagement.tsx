
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdvertising } from '@/hooks/useAdvertising';
import { Plus, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import type { AdBanner } from '@/types/advertising';

const AdBannerManagement = () => {
  const [selectedType, setSelectedType] = useState<'client' | 'repairer'>('client');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_url: '',
    target_type: 'client' as 'client' | 'repairer',
    start_date: '',
    end_date: '',
    max_impressions: '',
    max_clicks: '',
    daily_budget: ''
  });

  const {
    banners,
    loading,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    getStats
  } = useAdvertising();

  useEffect(() => {
    fetchBanners(selectedType);
  }, [selectedType]);

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      target_url: '',
      target_type: selectedType,
      start_date: '',
      end_date: '',
      max_impressions: '',
      max_clicks: '',
      daily_budget: ''
    });
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const bannerData = {
        ...formData,
        max_impressions: formData.max_impressions ? parseInt(formData.max_impressions) : undefined,
        max_clicks: formData.max_clicks ? parseInt(formData.max_clicks) : undefined,
        daily_budget: formData.daily_budget ? parseFloat(formData.daily_budget) : undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        targeting_config: {}
      };

      if (editingBanner) {
        await updateBanner(editingBanner.id, bannerData);
      } else {
        await createBanner(bannerData);
      }

      setIsCreateModalOpen(false);
      resetForm();
      fetchBanners(selectedType);
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleEdit = (banner: AdBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      target_url: banner.target_url,
      target_type: banner.target_type,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      max_impressions: banner.max_impressions?.toString() || '',
      max_clicks: banner.max_clicks?.toString() || '',
      daily_budget: banner.daily_budget?.toString() || ''
    });
    setIsCreateModalOpen(true);
  };

  const toggleBannerStatus = async (banner: AdBanner) => {
    await updateBanner(banner.id, { is_active: !banner.is_active });
    fetchBanners(selectedType);
  };

  const calculateCTR = (banner: AdBanner) => {
    if (banner.current_impressions === 0) return 0;
    return ((banner.current_clicks / banner.current_impressions) * 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Bannières Publicitaires</h2>
          <p className="text-gray-600">
            Gérez les bannières pour les {selectedType === 'client' ? 'clients' : 'réparateurs'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedType} onValueChange={(value: 'client' | 'repairer') => setSelectedType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="repairer">Réparateurs</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Bannière
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? 'Modifier' : 'Créer'} une bannière
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
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

                <div>
                  <Label htmlFor="image_url">URL de l'image (728x90px)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="target_url">URL de destination</Label>
                  <Input
                    id="target_url"
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max_impressions">Max impressions</Label>
                    <Input
                      id="max_impressions"
                      type="number"
                      value={formData.max_impressions}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_impressions: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="max_clicks">Max clics</Label>
                    <Input
                      id="max_clicks"
                      type="number"
                      value={formData.max_clicks}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_clicks: e.target.value }))}
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
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingBanner ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : banners.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Aucune bannière trouvée</p>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-20 h-6 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    
                    <div>
                      <h3 className="font-semibold">{banner.title}</h3>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {banner.target_url}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                          {banner.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Badge variant="outline">
                          {banner.target_type === 'client' ? 'Clients' : 'Réparateurs'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Impressions</div>
                      <div className="font-semibold">{banner.current_impressions}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Clics</div>
                      <div className="font-semibold">{banner.current_clicks}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">CTR</div>
                      <div className="font-semibold">{calculateCTR(banner)}%</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => toggleBannerStatus(banner)}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdBannerManagement;
