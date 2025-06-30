
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Play, Pause, BarChart3, Target } from 'lucide-react';
import { AdCampaign, AdBanner } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget_total: '',
    budget_daily: '',
    start_date: '',
    end_date: '',
    status: 'draft' as const,
    targeting_user_types: [] as string[],
    targeting_subscription_tiers: '',
    targeting_device_types: '',
    targeting_cities: '',
    targeting_postal_codes: '',
    targeting_age_ranges: '',
    targeting_global: false
  });

  // Données mock temporaires pour la démo
  const mockCampaigns: AdCampaign[] = [
    {
      id: '1',
      name: 'Campagne Réparateurs Premium',
      description: 'Ciblage des réparateurs avec abonnement premium',
      budget_total: 1000,
      budget_daily: 50,
      budget_spent: 250,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      targeting_config: {
        user_types: ['repairer'],
        subscription_tiers: ['premium'],
        global: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Promotion Clients Paris',
      description: 'Offres spéciales pour les clients parisiens',
      budget_total: 500,
      budget_daily: 25,
      budget_spent: 125,
      start_date: new Date().toISOString(),
      status: 'active',
      targeting_config: {
        user_types: ['client'],
        cities: ['Paris'],
        global: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // Charger les campagnes (mock pour l'instant)
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Erreur lors du chargement des campagnes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les bannières existantes
  const fetchBanners = async () => {
    try {
      // Pour l'instant, on utilise des données mock
      setBanners([]);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchBanners();
  }, []);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget_total: '',
      budget_daily: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      targeting_user_types: [],
      targeting_subscription_tiers: '',
      targeting_device_types: '',
      targeting_cities: '',
      targeting_postal_codes: '',
      targeting_age_ranges: '',
      targeting_global: false
    });
    setEditingCampaign(null);
    setShowForm(false);
  };

  // Sauvegarder une campagne (mock pour l'instant)
  const saveCampaign = async () => {
    try {
      const targeting_config = {
        user_types: formData.targeting_user_types as ('client' | 'repairer')[],
        subscription_tiers: formData.targeting_subscription_tiers ? 
          formData.targeting_subscription_tiers.split(',').map(s => s.trim()) : [],
        device_types: formData.targeting_device_types ? 
          formData.targeting_device_types.split(',').map(s => s.trim()) : [],
        cities: formData.targeting_cities ? 
          formData.targeting_cities.split(',').map(s => s.trim()) : [],
        postal_codes: formData.targeting_postal_codes ? 
          formData.targeting_postal_codes.split(',').map(s => s.trim()) : [],
        age_ranges: formData.targeting_age_ranges ? 
          formData.targeting_age_ranges.split(',').map(s => s.trim()) : [],
        global: formData.targeting_global
      };

      const campaignData: AdCampaign = {
        id: editingCampaign?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        budget_total: parseFloat(formData.budget_total),
        budget_daily: parseFloat(formData.budget_daily),
        budget_spent: 0,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        status: formData.status,
        targeting_config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user?.id
      };

      if (editingCampaign) {
        setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? campaignData : c));
        toast.success('Campagne mise à jour avec succès');
      } else {
        setCampaigns(prev => [...prev, campaignData]);
        toast.success('Campagne créée avec succès');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Éditer une campagne
  const editCampaign = (campaign: AdCampaign) => {
    const targeting = campaign.targeting_config;
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      budget_total: campaign.budget_total.toString(),
      budget_daily: campaign.budget_daily.toString(),
      start_date: campaign.start_date?.split('T')[0] || '',
      end_date: campaign.end_date?.split('T')[0] || '',
      status: campaign.status,
      targeting_user_types: targeting.user_types || [],
      targeting_subscription_tiers: targeting.subscription_tiers?.join(', ') || '',
      targeting_device_types: targeting.device_types?.join(', ') || '',
      targeting_cities: targeting.cities?.join(', ') || '',
      targeting_postal_codes: targeting.postal_codes?.join(', ') || '',
      targeting_age_ranges: targeting.age_ranges?.join(', ') || '',
      targeting_global: targeting.global || false
    });
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  // Changer le statut d'une campagne
  const toggleCampaignStatus = async (campaign: AdCampaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id ? { ...c, status: newStatus } : c
      ));
      toast.success(`Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'}`);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Supprimer une campagne
  const deleteCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campagne supprimée');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminée';
      case 'draft': return 'Brouillon';
      default: return status;
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
          <h2 className="text-2xl font-bold">Gestion des campagnes publicitaires</h2>
          <p className="text-gray-600">Créez et gérez vos campagnes publicitaires ciblées</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">Informations générales</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="targeting">Ciblage</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom de la campagne</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ma campagne publicitaire"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">En pause</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la campagne..."
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
                    <Label htmlFor="end_date">Date de fin (optionnelle)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="budget" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_total">Budget total (€)</Label>
                    <Input
                      id="budget_total"
                      type="number"
                      step="0.01"
                      value={formData.budget_total}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_total: e.target.value }))}
                      placeholder="1000.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_daily">Budget quotidien (€)</Label>
                    <Input
                      id="budget_daily"
                      type="number"
                      step="0.01"
                      value={formData.budget_daily}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_daily: e.target.value }))}
                      placeholder="50.00"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="targeting" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="targeting_global"
                    checked={formData.targeting_global}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, targeting_global: checked }))
                    }
                  />
                  <Label htmlFor="targeting_global">Ciblage global (tous les utilisateurs)</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targeting_user_types">Types d'utilisateurs</Label>
                    <Select
                      value={formData.targeting_user_types[0] || ''}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, targeting_user_types: [value] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Clients</SelectItem>
                        <SelectItem value="repairer">Réparateurs</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targeting_cities">Villes ciblées</Label>
                    <Input
                      id="targeting_cities"
                      value={formData.targeting_cities}
                      onChange={(e) => setFormData(prev => ({ ...prev, targeting_cities: e.target.value }))}
                      placeholder="Paris, Lyon, Marseille"
                      disabled={formData.targeting_global}
                    />
                  </div>
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
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-2 mt-6">
              <Button onClick={saveCampaign}>
                {editingCampaign ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des campagnes */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  
                  {campaign.description && (
                    <p className="text-gray-600 mb-2">{campaign.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Budget: {campaign.budget_spent}€ / {campaign.budget_total}€</span>
                    <span>Quotidien: {campaign.budget_daily}€</span>
                    <span>Début: {new Date(campaign.start_date).toLocaleDateString()}</span>
                    {campaign.end_date && (
                      <span>Fin: {new Date(campaign.end_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCampaignStatus(campaign)}
                    disabled={campaign.status === 'completed'}
                  >
                    {campaign.status === 'active' ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editCampaign(campaign)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune campagne créée pour le moment.</p>
            <Button onClick={() => setShowForm(true)}>
              Créer votre première campagne
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignManagement;
