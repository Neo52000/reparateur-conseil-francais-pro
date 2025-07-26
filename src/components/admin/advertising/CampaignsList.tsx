import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { AdvertisingCampaignService } from '@/services/advertising/AdvertisingCampaignService';
import { NewCampaignDialog } from './NewCampaignDialog';
import { useToast } from '@/hooks/use-toast';

export const CampaignsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await AdvertisingCampaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les campagnes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: 'play' | 'pause' | 'optimize') => {
    setIsUpdating(campaignId);
    try {
      let newStatus = '';
      switch (action) {
        case 'play':
          newStatus = 'active';
          await AdvertisingCampaignService.updateCampaign(campaignId, { status: 'active' });
          break;
        case 'pause':
          newStatus = 'paused';
          await AdvertisingCampaignService.updateCampaign(campaignId, { status: 'paused' });
          break;
        case 'optimize':
          // Logique d'optimisation IA
          toast({
            title: "Optimisation lancée",
            description: "L'IA analyse et optimise votre campagne...",
          });
          return;
      }

      // Mettre à jour localement
      setCampaigns(prev => prev.map((c: any) => 
        c.id === campaignId ? { ...c, status: newStatus } : c
      ));

      toast({
        title: "Succès",
        description: `Campagne ${action === 'play' ? 'activée' : 'mise en pause'} avec succès`,
      });
    } catch (error) {
      console.error(`Erreur ${action}:`, error);
      toast({
        title: "Erreur",
        description: `Impossible de ${action === 'play' ? 'activer' : 'mettre en pause'} la campagne`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'paused':
        return <Badge variant="secondary">En pause</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header et Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gestion des campagnes</h2>
          <p className="text-muted-foreground">
            Créez et gérez vos campagnes publicitaires multi-canaux
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCampaigns} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <NewCampaignDialog onCampaignCreated={loadCampaigns} />
        </div>
      </div>

      {/* Filtres et Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une campagne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'paused', 'draft'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                >
                  {status === 'all' ? 'Toutes' : 
                   status === 'active' ? 'Actives' :
                   status === 'paused' ? 'En pause' : 'Brouillons'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des campagnes */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Chargement des campagnes...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign: any) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(campaign.status)}
                          <span className="text-sm text-muted-foreground">
                            {Array.isArray(campaign.channels) ? campaign.channels.join(' • ') : 'Multi-plateformes'}
                          </span>
                        </div>
                      </div>
                  </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Budget/jour</p>
                        <p className="font-semibold">€{campaign.budget_daily.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dépensé</p>
                        <p className="font-semibold">€{campaign.budget_spent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Créé le</p>
                        <p className="font-semibold">
                          {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-semibold capitalize">{campaign.campaign_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Style</p>
                        <p className="font-semibold capitalize">{campaign.creative_style || 'Standard'}</p>
                      </div>
                    </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {campaign.status === 'active' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'pause')}
                      disabled={isUpdating === campaign.id}
                    >
                      {isUpdating === campaign.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                  ) : campaign.status === 'paused' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'play')}
                      disabled={isUpdating === campaign.id}
                    >
                      {isUpdating === campaign.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'play')}
                      disabled={isUpdating === campaign.id}
                    >
                      {isUpdating === campaign.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCampaignAction(campaign.id, 'optimize')}
                    title="Optimiser avec IA"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
        </div>
      )}

      {!isLoading && filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucune campagne trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Aucune campagne ne correspond à votre recherche.' : 
                 'Vous n\'avez pas encore créé de campagne.'}
              </p>
              <NewCampaignDialog 
                onCampaignCreated={loadCampaigns}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer ma première campagne
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};