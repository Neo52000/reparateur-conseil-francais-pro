import { useState } from 'react';
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
  Zap
} from 'lucide-react';

const mockCampaigns = [
  {
    id: '1',
    name: 'Réparation iPhone - Proximité',
    status: 'active' as const,
    budget_daily: 45.00,
    budget_spent: 320.50,
    impressions: 12500,
    clicks: 340,
    conversions: 12,
    roas: 3.8,
    channels: ['Google Ads', 'Meta Ads'],
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Samsung Galaxy - Urgence',
    status: 'paused' as const,
    budget_daily: 30.00,
    budget_spent: 180.20,
    impressions: 8200,
    clicks: 210,
    conversions: 8,
    roas: 2.9,
    channels: ['Google Ads'],
    created_at: '2024-01-10'
  },
  {
    id: '3',
    name: 'Écrans cassés - Premium',
    status: 'draft' as const,
    budget_daily: 60.00,
    budget_spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    roas: 0,
    channels: ['Google Ads', 'Meta Ads', 'Microsoft Ads'],
    created_at: '2024-01-20'
  }
];

export const CampaignsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  const filteredCampaigns = mockCampaigns.filter(campaign => {
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </Button>
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
      <div className="grid gap-4">
        {filteredCampaigns.map((campaign) => (
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
                          {campaign.channels.join(' • ')}
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
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clics</p>
                      <p className="font-semibold">{campaign.clicks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROAS</p>
                      <div className="flex items-center gap-1">
                        <p className="font-semibold">{campaign.roas.toFixed(1)}x</p>
                        {campaign.roas > 3 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {campaign.status === 'active' ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer ma première campagne
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};