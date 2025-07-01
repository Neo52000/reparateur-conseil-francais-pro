
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, TestTube, TrendingUp, Award } from 'lucide-react';
import { CampaignVariant } from '@/types/advancedAdvertising';
import { AutomatedCampaignService } from '@/services/automatedCampaigns';
import { toast } from 'sonner';

const ABTestingManager: React.FC = () => {
  const [variants, setVariants] = useState<CampaignVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    campaign_id: '',
    variant_name: '',
    variant_data: {
      message_variations: {
        title: '',
        description: '',
        cta_text: ''
      }
    },
    traffic_split: 50
  });

  // Données mock pour la démonstration
  const mockVariants: CampaignVariant[] = [
    {
      id: '1',
      campaign_id: '1',
      variant_name: 'Version A - Message Standard',
      variant_data: {
        message_variations: {
          title: 'Réparation iPhone rapide',
          description: 'Réparez votre iPhone en moins de 2h',
          cta_text: 'Trouver un réparateur'
        }
      },
      traffic_split: 50,
      performance_metrics: {
        impressions: 15420,
        clicks: 890,
        conversions: 125,
        ctr: 5.77,
        conversion_rate: 14.04
      },
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      campaign_id: '1',
      variant_name: 'Version B - Message Urgence',
      variant_data: {
        message_variations: {
          title: 'iPhone cassé ? Réparation immédiate !',
          description: 'Service express - Votre iPhone réparé aujourd\'hui',
          cta_text: 'Réparer maintenant'
        }
      },
      traffic_split: 50,
      performance_metrics: {
        impressions: 15280,
        clicks: 1205,
        conversions: 178,
        ctr: 7.89,
        conversion_rate: 14.77
      },
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      // Pour l'instant, utiliser les données mock
      await new Promise(resolve => setTimeout(resolve, 500));
      setVariants(mockVariants);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Erreur lors du chargement des variantes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await AutomatedCampaignService.createCampaignVariant({
        ...formData,
        performance_metrics: {},
        is_active: true
      });
      
      toast.success('Variante A/B créée');
      resetForm();
      fetchVariants();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      campaign_id: '',
      variant_name: '',
      variant_data: {
        message_variations: {
          title: '',
          description: '',
          cta_text: ''
        }
      },
      traffic_split: 50
    });
    setShowForm(false);
  };

  const getWinnerBadge = (variants: CampaignVariant[]) => {
    if (variants.length < 2) return null;
    
    const winner = variants.reduce((prev, current) => 
      (current.performance_metrics?.conversion_rate || 0) > (prev.performance_metrics?.conversion_rate || 0) 
        ? current : prev
    );
    
    return winner;
  };

  const winner = getWinnerBadge(variants);

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-green-500" />
            Tests A/B & Optimisation
          </h2>
          <p className="text-gray-600">Testez et optimisez vos campagnes publicitaires</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau test A/B
        </Button>
      </div>

      {/* Résumé des performances */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Résultats du test A/B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  +{((winner?.performance_metrics?.conversion_rate || 0) - 
                      (variants.find(v => v.id !== winner?.id)?.performance_metrics?.conversion_rate || 0)).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Amélioration de conversion</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {winner?.performance_metrics?.ctr?.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600">Meilleur CTR</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {winner?.performance_metrics?.conversions}
                </p>
                <p className="text-sm text-gray-600">Conversions totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau test A/B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="variant_name">Nom de la variante</Label>
              <Input
                id="variant_name"
                value={formData.variant_name}
                onChange={(e) => setFormData(prev => ({ ...prev, variant_name: e.target.value }))}
                placeholder="Ex: Version avec urgence"
              />
            </div>

            <div>
              <Label htmlFor="title">Titre de l'annonce</Label>
              <Input
                id="title"
                value={formData.variant_data.message_variations?.title}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    variant_data: {
                      ...prev.variant_data,
                      message_variations: {
                        ...prev.variant_data.message_variations!,
                        title: e.target.value
                      }
                    }
                  }))
                }
                placeholder="Titre accrocheur"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.variant_data.message_variations?.description}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    variant_data: {
                      ...prev.variant_data,
                      message_variations: {
                        ...prev.variant_data.message_variations!,
                        description: e.target.value
                      }
                    }
                  }))
                }
                placeholder="Description détaillée"
              />
            </div>

            <div>
              <Label htmlFor="cta_text">Texte du bouton</Label>
              <Input
                id="cta_text"
                value={formData.variant_data.message_variations?.cta_text}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    variant_data: {
                      ...prev.variant_data,
                      message_variations: {
                        ...prev.variant_data.message_variations!,
                        cta_text: e.target.value
                      }
                    }
                  }))
                }
                placeholder="Ex: Réparer maintenant"
              />
            </div>

            <div>
              <Label htmlFor="traffic_split">Répartition du trafic (%)</Label>
              <Input
                id="traffic_split"
                type="number"
                min="10"
                max="90"
                value={formData.traffic_split}
                onChange={(e) => setFormData(prev => ({ ...prev, traffic_split: parseInt(e.target.value) }))}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                Créer le test
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des variantes */}
      <div className="grid gap-4">
        {variants.map((variant) => {
          const isWinner = winner?.id === variant.id;
          
          return (
            <Card key={variant.id} className={isWinner ? 'border-green-500 shadow-md' : ''}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{variant.variant_name}</h3>
                      {isWinner && (
                        <Badge className="bg-green-500">
                          <Award className="h-3 w-3 mr-1" />
                          Gagnant
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {variant.traffic_split}% du trafic
                      </Badge>
                    </div>
                    <Badge variant={variant.is_active ? "default" : "secondary"}>
                      {variant.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Aperçu du message */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-600">
                      {variant.variant_data.message_variations?.title}
                    </h4>
                    <p className="text-gray-700 text-sm mt-1">
                      {variant.variant_data.message_variations?.description}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      {variant.variant_data.message_variations?.cta_text}
                    </Button>
                  </div>

                  {/* Métriques de performance */}
                  {variant.performance_metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Impressions</p>
                        <p className="text-lg font-semibold">
                          {variant.performance_metrics.impressions?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Clics</p>
                        <p className="text-lg font-semibold">
                          {variant.performance_metrics.clicks?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CTR</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {variant.performance_metrics.ctr?.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversions</p>
                        <p className="text-lg font-semibold text-green-600">
                          {variant.performance_metrics.conversions}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Taux de conversion</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {variant.performance_metrics.conversion_rate?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Barre de progression pour le trafic */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Répartition du trafic</span>
                      <span>{variant.traffic_split}%</span>
                    </div>
                    <Progress value={variant.traffic_split} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {variants.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucun test A/B configuré.</p>
            <Button onClick={() => setShowForm(true)}>
              Créer votre premier test A/B
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ABTestingManager;
