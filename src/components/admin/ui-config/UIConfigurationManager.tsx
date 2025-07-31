import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload,
  Settings,
  Eye,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';

export const UIConfigurationManager: React.FC = () => {
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'plan_visualization' | 'repairer_dashboard'>('all');
  
  const { toast } = useToast();
  const { 
    configurations, 
    templates, 
    themes, 
    abTests,
    saveConfiguration, 
    deleteConfiguration, 
    cloneConfiguration,
    createABTest,
    trackAnalyticsEvent 
  } = useUIConfigurations();

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || config.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDeleteConfiguration = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      await deleteConfiguration(id);
      if (selectedConfig === id) {
        setSelectedConfig(null);
      }
    }
  };

  const handleCloneConfiguration = async (id: string, name: string) => {
    const newName = prompt('Nom de la nouvelle configuration:', `${name} - Copie`);
    if (newName) {
      await cloneConfiguration(id, newName);
    }
  };

  const handleCreateABTest = async (configId: string) => {
    const testName = prompt('Nom du test A/B:');
    if (testName) {
      await createABTest({
        name: testName,
        control_config_id: configId,
        status: 'draft',
        traffic_split: 0.5,
        target_audience: {},
        success_metrics: { conversion_rate: true, engagement: true }
      });
    }
  };

  const selectedConfiguration = configurations.find(config => config.id === selectedConfig);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestionnaire de Configurations UI</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos configurations d'interface utilisateur
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des configurations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configurations</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">Tous les types</option>
                    <option value="plan_visualization">Plans</option>
                    <option value="repairer_dashboard">Tableaux de bord</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredConfigurations.map((config) => (
                    <div 
                      key={config.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedConfig === config.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedConfig(config.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{config.name}</h4>
                            <Badge variant={config.is_active ? 'default' : 'secondary'}>
                              {config.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Badge variant="outline">
                              {config.type === 'plan_visualization' ? 'Plan' : 'Dashboard'}
                            </Badge>
                          </div>
                          {config.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {config.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Version {config.version}</span>
                            <span>{new Date(config.created_at).toLocaleDateString()}</span>
                            <span>{config.tags.length} tags</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Ouvrir l'aperçu
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloneConfiguration(config.id, config.name);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateABTest(config.id);
                            }}
                          >
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfiguration(config.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Détails de la configuration sélectionnée */}
        <div className="lg:col-span-1">
          {selectedConfiguration ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Détails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nom</Label>
                  <p className="text-sm">{selectedConfiguration.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm capitalize">{selectedConfiguration.type.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <Badge variant={selectedConfiguration.is_active ? 'default' : 'secondary'}>
                    {selectedConfiguration.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Version</Label>
                  <p className="text-sm">{selectedConfiguration.version}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Créé le</Label>
                  <p className="text-sm">{new Date(selectedConfiguration.created_at).toLocaleString()}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Modifié le</Label>
                  <p className="text-sm">{new Date(selectedConfiguration.updated_at).toLocaleString()}</p>
                </div>
                
                {selectedConfiguration.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm">{selectedConfiguration.description}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedConfiguration.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button className="w-full" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez une configuration pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Configurations</p>
                <p className="text-2xl font-bold">{configurations.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thèmes</p>
                <p className="text-2xl font-bold">{themes.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests A/B</p>
                <p className="text-2xl font-bold">{abTests.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};