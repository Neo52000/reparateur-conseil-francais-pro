
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Users, MapPin, Smartphone } from 'lucide-react';
import { TargetingSegment } from '@/types/advertising';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdvancedTargeting: React.FC = () => {
  const [segments, setSegments] = useState<TargetingSegment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<TargetingSegment | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    user_types: [] as string[],
    subscription_tiers: [] as string[],
    cities: '',
    postal_codes: '',
    device_preferences: [] as string[],
    age_ranges: [] as string[],
    behavior_patterns: [] as string[],
    purchase_history: [] as string[],
    is_active: true
  });

  const userTypeOptions = [
    { value: 'client', label: 'Clients' },
    { value: 'repairer', label: 'Réparateurs' }
  ];

  const subscriptionTierOptions = [
    { value: 'free', label: 'Gratuit' },
    { value: 'basic', label: 'Basique' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const deviceOptions = [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'tablet', label: 'Tablette' },
    { value: 'laptop', label: 'Ordinateur portable' },
    { value: 'console', label: 'Console de jeu' },
    { value: 'watch', label: 'Montre connectée' }
  ];

  const ageRangeOptions = [
    { value: '18-25', label: '18-25 ans' },
    { value: '26-35', label: '26-35 ans' },
    { value: '36-45', label: '36-45 ans' },
    { value: '46-55', label: '46-55 ans' },
    { value: '56+', label: '56+ ans' }
  ];

  const behaviorOptions = [
    { value: 'frequent_user', label: 'Utilisateur fréquent' },
    { value: 'price_sensitive', label: 'Sensible au prix' },
    { value: 'quality_focused', label: 'Axé qualité' },
    { value: 'early_adopter', label: 'Adopteur précoce' },
    { value: 'brand_loyal', label: 'Fidèle à la marque' }
  ];

  const purchaseHistoryOptions = [
    { value: 'first_time', label: 'Premier achat' },
    { value: 'repeat_customer', label: 'Client récurrent' },
    { value: 'high_value', label: 'Forte valeur' },
    { value: 'recent_purchase', label: 'Achat récent' },
    { value: 'abandoned_cart', label: 'Panier abandonné' }
  ];

  // Données mock pour la démo
  const mockSegments: TargetingSegment[] = [
    {
      id: '1',
      name: 'Réparateurs Premium Paris',
      description: 'Réparateurs avec abonnement premium dans la région parisienne',
      criteria: {
        user_types: ['repairer'],
        subscription_tiers: ['premium'],
        cities: ['Paris', 'Boulogne-Billancourt', 'Levallois-Perret'],
        device_preferences: ['smartphone', 'tablet']
      },
      estimated_reach: 1250,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Clients Fidèles Lyon',
      description: 'Clients récurrents basés à Lyon',
      criteria: {
        user_types: ['client'],
        cities: ['Lyon'],
        behavior_patterns: ['repeat_customer', 'brand_loyal'],
        purchase_history: ['repeat_customer', 'high_value']
      },
      estimated_reach: 850,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  // Charger les segments depuis Supabase
  const fetchSegments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advanced_targeting_segments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform Supabase data to match TargetingSegment interface
      const transformedSegments = (data || []).map((item): TargetingSegment => ({
        id: item.id,
        name: item.name,
        description: item.description,
        criteria: typeof item.criteria === 'object' ? item.criteria as any : {},
        estimated_reach: item.estimated_reach,
        is_active: item.is_active,
        created_at: item.created_at
      }));
      
      setSegments(transformedSegments.length > 0 ? transformedSegments : mockSegments);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Erreur lors du chargement des segments');
      setSegments(mockSegments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  // Calculer la portée estimée
  const calculateEstimatedReach = async (criteria: any): Promise<number> => {
    try {
      // Simulation de calcul de portée basée sur les critères
      let baseReach = 10000; // Base d'utilisateurs
      
      if (criteria.user_types?.length > 0) {
        baseReach *= 0.6; // Réduction si ciblage spécifique
      }
      
      if (criteria.subscription_tiers?.length > 0) {
        baseReach *= 0.4;
      }
      
      if (criteria.cities || criteria.postal_codes) {
        baseReach *= 0.3;
      }
      
      return Math.floor(baseReach);
    } catch (error) {
      console.error('Error calculating reach:', error);
      return 0;
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      user_types: [],
      subscription_tiers: [],
      cities: '',
      postal_codes: '',
      device_preferences: [],
      age_ranges: [],
      behavior_patterns: [],
      purchase_history: [],
      is_active: true
    });
    setEditingSegment(null);
    setShowForm(false);
  };

  // Sauvegarder un segment (mock pour l'instant)
  const saveSegment = async () => {
    try {
      const criteria = {
        user_types: formData.user_types,
        subscription_tiers: formData.subscription_tiers,
        cities: formData.cities ? formData.cities.split(',').map(s => s.trim()) : [],
        postal_codes: formData.postal_codes ? formData.postal_codes.split(',').map(s => s.trim()) : [],
        device_preferences: formData.device_preferences,
        age_ranges: formData.age_ranges,
        behavior_patterns: formData.behavior_patterns,
        purchase_history: formData.purchase_history
      };

      const estimated_reach = await calculateEstimatedReach(criteria);

      const segmentData: TargetingSegment = {
        id: editingSegment?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        criteria,
        estimated_reach,
        is_active: formData.is_active,
        created_at: new Date().toISOString()
      };

      if (editingSegment) {
        setSegments(prev => prev.map(s => s.id === editingSegment.id ? segmentData : s));
        toast.success('Segment mis à jour avec succès');
      } else {
        setSegments(prev => [...prev, segmentData]);
        toast.success('Segment créé avec succès');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving segment:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Fonctions pour gérer les sélections multiples
  const toggleSelection = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ciblage avancé</h2>
          <p className="text-gray-600">Créez des segments d'audience pour un ciblage précis</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau segment
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSegment ? 'Modifier le segment' : 'Nouveau segment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Informations de base</TabsTrigger>
                <TabsTrigger value="demographics">Démographie</TabsTrigger>
                <TabsTrigger value="behavior">Comportement</TabsTrigger>
                <TabsTrigger value="geographic">Géographie</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du segment</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Réparateurs Premium Paris"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du segment..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label htmlFor="is_active">Segment actif</Label>
                </div>
              </TabsContent>

              <TabsContent value="demographics" className="space-y-4">
                <div>
                  <Label>Types d'utilisateurs</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userTypeOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={formData.user_types.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          user_types: toggleSelection(prev.user_types, option.value)
                        }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Niveaux d'abonnement</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {subscriptionTierOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={formData.subscription_tiers.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          subscription_tiers: toggleSelection(prev.subscription_tiers, option.value)
                        }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tranches d'âge</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ageRangeOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={formData.age_ranges.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          age_ranges: toggleSelection(prev.age_ranges, option.value)
                        }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div>
                  <Label>Préférences d'appareils</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {deviceOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={formData.device_preferences.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          device_preferences: toggleSelection(prev.device_preferences, option.value)
                        }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Modèles comportementaux</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {behaviorOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={formData.behavior_patterns.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          behavior_patterns: toggleSelection(prev.behavior_patterns, option.value)
                        }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Historique d'achat</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {purchaseHistoryOptions.map(option => (
                      <Badge
                        key={option.value}
                        variant={formData.purchase_history.includes(option.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          purchase_history: toggleSelection(prev.purchase_history, option.value)
                        }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="geographic" className="space-y-4">
                <div>
                  <Label htmlFor="cities">Villes (séparées par des virgules)</Label>
                  <Input
                    id="cities"
                    value={formData.cities}
                    onChange={(e) => setFormData(prev => ({ ...prev, cities: e.target.value }))}
                    placeholder="Paris, Lyon, Marseille"
                  />
                </div>

                <div>
                  <Label htmlFor="postal_codes">Codes postaux (séparés par des virgules)</Label>
                  <Input
                    id="postal_codes"
                    value={formData.postal_codes}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_codes: e.target.value }))}
                    placeholder="75001, 69000, 13000"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-2 mt-6">
              <Button onClick={saveSegment}>
                {editingSegment ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des segments */}
      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">{segment.name}</h3>
                    <Badge variant={segment.is_active ? "default" : "secondary"}>
                      {segment.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{segment.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Portée estimée: {segment.estimated_reach.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Aperçu des critères */}
                  <div className="space-y-2">
                    {segment.criteria.user_types && segment.criteria.user_types.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Types: </span>
                        <div className="flex space-x-1">
                          {segment.criteria.user_types.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {segment.criteria.cities && segment.criteria.cities.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Villes: </span>
                        <div className="flex space-x-1">
                          {segment.criteria.cities.slice(0, 3).map(city => (
                            <Badge key={city} variant="outline" className="text-xs">
                              {city}
                            </Badge>
                          ))}
                          {segment.criteria.cities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.criteria.cities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {segment.criteria.device_preferences && segment.criteria.device_preferences.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Appareils: </span>
                        <div className="flex space-x-1">
                          {segment.criteria.device_preferences.slice(0, 3).map(device => (
                            <Badge key={device} variant="outline" className="text-xs">
                              {device}
                            </Badge>
                          ))}
                          {segment.criteria.device_preferences.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.criteria.device_preferences.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Charger les données du segment dans le formulaire
                      const criteria = segment.criteria;
                      setFormData({
                        name: segment.name,
                        description: segment.description,
                        user_types: criteria.user_types || [],
                        subscription_tiers: criteria.subscription_tiers || [],
                        cities: criteria.cities?.join(', ') || '',
                        postal_codes: criteria.postal_codes?.join(', ') || '',
                        device_preferences: criteria.device_preferences || [],
                        age_ranges: criteria.age_ranges || [],
                        behavior_patterns: criteria.behavior_patterns || [],
                        purchase_history: criteria.purchase_history || [],
                        is_active: segment.is_active
                      });
                      setEditingSegment(segment);
                      setShowForm(true);
                    }}
                  >
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucun segment de ciblage créé.</p>
            <Button onClick={() => setShowForm(true)}>
              Créer votre premier segment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedTargeting;
