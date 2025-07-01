import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Zap, Clock, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { AutomatedCampaign } from '@/types/advancedAdvertising';
import { AutomatedCampaignService } from '@/services/automatedCampaigns';
import { toast } from 'sonner';

const AutomatedCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AutomatedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AutomatedCampaign | null>(null);

  const [formData, setFormData] = useState({
    campaign_id: '',
    campaign_type: 'acquisition' as 'acquisition' | 'reactivation' | 'loyalty' | 'contextual',
    triggers: {
      schedule: {
        frequency: 'daily',
        time: '09:00',
        days: ['1', '2', '3', '4', '5'] // Lundi à Vendredi
      },
      conditions: []
    },
    rules: {
      budget_adjustments: {
        increase_threshold: 80,
        decrease_threshold: 20,
        max_adjustment: 50
      },
      targeting_optimization: true,
      creative_rotation: true
    },
    is_active: true
  });

  const campaignTypes = [
    {
      value: 'acquisition',
      label: 'Acquisition',
      description: 'Cibler de nouveaux clients potentiels',
      icon: '🎯'
    },
    {
      value: 'reactivation',
      label: 'Réactivation',
      description: 'Réengager les utilisateurs inactifs',
      icon: '🔄'
    },
    {
      value: 'loyalty',
      label: 'Fidélisation',
      description: 'Renforcer la fidélité des clients existants',
      icon: '💎'
    },
    {
      value: 'contextual',
      label: 'Contextuelle',
      description: 'Adapter aux tendances et événements',
      icon: '🌟'
    }
  ];

  const frequencies = [
    { value: 'hourly', label: 'Toutes les heures' },
    { value: 'daily', label: 'Quotidienne' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuelle' }
  ];

  useEffect(() => {
    fetchAutomatedCampaigns();
  }, []);

  const fetchAutomatedCampaigns = async () => {
    try {
      setLoading(true);
      const data = await AutomatedCampaignService.getAutomatedCampaigns();
      
      // Convert Supabase data to proper TypeScript types
      const convertedData: AutomatedCampaign[] = (data || []).map(campaign => ({
        ...campaign,
        campaign_type: campaign.campaign_type as 'acquisition' | 'reactivation' | 'loyalty' | 'contextual',
        triggers: typeof campaign.triggers === 'string' ? JSON.parse(campaign.triggers) : campaign.triggers,
        rules: typeof campaign.rules === 'string' ? JSON.parse(campaign.rules) : campaign.rules
      }));
      
      setCampaigns(convertedData);
    } catch (error) {
      console.error('Error fetching automated campaigns:', error);
      toast.error('Erreur lors du chargement des campagnes automatisées');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingCampaign) {
        // Mise à jour (à implémenter)
        toast.success('Campagne automatisée mise à jour');
      } else {
        await AutomatedCampaignService.createAutomatedCampaign(formData);
        toast.success('Campagne automatisée créée');
      }
      
      resetForm();
      fetchAutomatedCampaigns();
    } catch (error) {
      console.error('Error saving automated campaign:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      campaign_id: '',
      campaign_type: 'acquisition',
      triggers: {
        schedule: {
          frequency: 'daily',
          time: '09:00',
          days: ['1', '2', '3', '4', '5']
        },
        conditions: []
      },
      rules: {
        budget_adjustments: {
          increase_threshold: 80,
          decrease_threshold: 20,
          max_adjustment: 50
        },
        targeting_optimization: true,
        creative_rotation: true
      },
      is_active: true
    });
    setEditingCampaign(null);
    setShowForm(false);
  };

  const executeAutomation = async () => {
    try {
      await AutomatedCampaignService.executeAutomatedCampaigns();
      toast.success('Exécution des automatisations démarrée');
      fetchAutomatedCampaigns();
    } catch (error) {
      console.error('Error executing automations:', error);
      toast.error('Erreur lors de l\'exécution');
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Campagnes Automatisées
            <Badge variant="secondary">Beta</Badge>
          </h2>
          <p className="text-gray-600">Intelligence artificielle et automatisation avancée</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={executeAutomation}>
            <Brain className="h-4 w-4 mr-2" />
            Exécuter maintenant
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle automatisation
          </Button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCampaign ? 'Modifier l\'automatisation' : 'Nouvelle automatisation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="config" className="space-y-4">
              <TabsList>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="triggers">Déclencheurs</TabsTrigger>
                <TabsTrigger value="rules">Règles d'optimisation</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-4">
                <div>
                  <Label htmlFor="campaign_type">Type de campagne automatisée</Label>
                  <Select
                    value={formData.campaign_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, campaign_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label htmlFor="is_active">Automatisation active</Label>
                </div>
              </TabsContent>

              
              
              <TabsContent value="triggers" className="space-y-4">
                <div>
                  <Label htmlFor="frequency">Fréquence d'exécution</Label>
                  <Select
                    value={formData.triggers.schedule?.frequency}
                    onValueChange={(value) => 
                      setFormData(prev => ({
                        ...prev,
                        triggers: {
                          ...prev.triggers,
                          schedule: { ...prev.triggers.schedule!, frequency: value }
                        }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">Heure d'exécution</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.triggers.schedule?.time}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        triggers: {
                          ...prev.triggers,
                          schedule: { ...prev.triggers.schedule!, time: e.target.value }
                        }
                      }))
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="rules" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Ajustements budgétaires automatiques</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="increase_threshold">Seuil d'augmentation (%)</Label>
                      <Input
                        id="increase_threshold"
                        type="number"
                        value={formData.rules.budget_adjustments?.increase_threshold}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            rules: {
                              ...prev.rules,
                              budget_adjustments: {
                                ...prev.rules.budget_adjustments!,
                                increase_threshold: parseInt(e.target.value)
                              }
                            }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_adjustment">Ajustement max (%)</Label>
                      <Input
                        id="max_adjustment"
                        type="number"
                        value={formData.rules.budget_adjustments?.max_adjustment}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            rules: {
                              ...prev.rules,
                              budget_adjustments: {
                                ...prev.rules.budget_adjustments!,
                                max_adjustment: parseInt(e.target.value)
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="targeting_optimization"
                      checked={formData.rules.targeting_optimization}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({
                          ...prev,
                          rules: { ...prev.rules, targeting_optimization: checked }
                        }))
                      }
                    />
                    <Label htmlFor="targeting_optimization">Optimisation automatique du ciblage</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="creative_rotation"
                      checked={formData.rules.creative_rotation}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({
                          ...prev,
                          rules: { ...prev.rules, creative_rotation: checked }
                        }))
                      }
                    />
                    <Label htmlFor="creative_rotation">Rotation automatique des créatifs</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-2 mt-6">
              <Button onClick={handleSave}>
                {editingCampaign ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des automatisations */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">
                      {campaignTypes.find(t => t.value === campaign.campaign_type)?.label} - 
                      Campagne #{campaign.campaign_id?.slice(0, 8) || 'N/A'}
                    </h3>
                    <Badge variant={campaign.is_active ? "default" : "secondary"}>
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {campaign.campaign_type === 'contextual' && (
                      <Badge variant="outline">
                        <Brain className="h-3 w-3 mr-1" />
                        IA
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {campaign.triggers?.schedule?.frequency || 'Programmé'}
                    </span>
                    {campaign.last_executed && (
                      <span>Dernière exécution: {new Date(campaign.last_executed).toLocaleDateString()}</span>
                    )}
                    {campaign.next_execution && (
                      <span>Prochaine: {new Date(campaign.next_execution).toLocaleDateString()}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {campaign.rules?.targeting_optimization && (
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Ciblage optimisé
                      </Badge>
                    )}
                    {campaign.rules?.creative_rotation && (
                      <Badge variant="outline" className="text-xs">
                        Rotation créatifs
                      </Badge>
                    )}
                    {campaign.rules?.budget_adjustments && (
                      <Badge variant="outline" className="text-xs">
                        Budget auto
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Toggle status
                      toast.info('Statut modifié');
                    }}
                  >
                    {campaign.is_active ? 'Désactiver' : 'Activer'}
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
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune automatisation configurée.</p>
            <Button onClick={() => setShowForm(true)}>
              Créer votre première automatisation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutomatedCampaigns;
