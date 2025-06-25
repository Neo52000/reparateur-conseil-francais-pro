import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, Zap, Users, TrendingUp, RefreshCw, Heart } from 'lucide-react';
import ScrapingControl from './ScrapingControl';
import ClientAccessControl from './ClientAccessControl';
import PromoCodesManagement from './PromoCodesManagement';
import ClientInterestManagement from './ClientInterestManagement';
import RepairersTable from './repairers/RepairersTable';
import RepairerProfileModal from './RepairerProfileModal';
import { useRepairersData } from '@/hooks/useRepairersData';

interface SubscriptionData {
  id: string;
  repairer_id: string;
  email: string;
  subscription_tier: string;
  billing_cycle: string;
  subscribed: boolean;
  subscription_end: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  plan_name: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
}

const AdminDashboard = () => {
  const { subscriptions, repairers, loading, stats, fetchData } = useRepairersData();
  const [subscriptionsData, setSubscriptionsData] = useState<SubscriptionData[]>([]);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'repairers' | 'scraping' | 'promocodes' | 'interest'>('subscriptions');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const fetchSubscriptionsData = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_subscription_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptionsData(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleViewProfile = (repairerId: string) => {
    setSelectedRepairerId(repairerId);
    setProfileModalOpen(true);
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return { name: 'Gratuit', color: 'bg-gray-100 text-gray-800', icon: null };
      case 'basic':
        return { name: 'Basique', color: 'bg-blue-100 text-blue-800', icon: <Star className="h-4 w-4" /> };
      case 'premium':
        return { name: 'Premium', color: 'bg-purple-100 text-purple-800', icon: <Zap className="h-4 w-4" /> };
      case 'enterprise':
        return { name: 'Enterprise', color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> };
      default:
        return { name: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backoffice Administrateur</h1>
          <p className="text-gray-600">Gestion de la plateforme RepairHub</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Client Access Control - Added at the top for visibility */}
      <ClientAccessControl />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Réparateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRepairers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réparateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRepairers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue.toFixed(2)}€</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Annuels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.yearlyRevenue.toFixed(2)}€</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Abonnements
        </button>
        <button
          onClick={() => setActiveTab('repairers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'repairers'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Réparateurs
        </button>
        <button
          onClick={() => setActiveTab('interest')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'interest'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Heart className="h-4 w-4 mr-1 inline" />
          Demandes d'intérêt
        </button>
        <button
          onClick={() => setActiveTab('promocodes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'promocodes'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Codes Promo
        </button>
        <button
          onClick={() => setActiveTab('scraping')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'scraping'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Scraping Moderne
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionsData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun abonnement trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Réparateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Facturation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Fin d'abonnement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionsData.map((subscription) => {
                    const tierInfo = getTierInfo(subscription.subscription_tier);
                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          {subscription.first_name || subscription.last_name ? 
                            `${subscription.first_name || ''} ${subscription.last_name || ''}`.trim() :
                            subscription.repairer_id
                          }
                        </TableCell>
                        <TableCell>{subscription.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {tierInfo.icon}
                            <Badge className={tierInfo.color}>
                              {tierInfo.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subscription.billing_cycle === 'yearly' ? 'Annuelle' : 'Mensuelle'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                            {subscription.subscribed ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.subscription_end 
                            ? new Date(subscription.subscription_end).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'repairers' && (
        <RepairersTable
          repairers={repairers}
          onViewProfile={handleViewProfile}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'interest' && <ClientInterestManagement />}

      {activeTab === 'promocodes' && <PromoCodesManagement />}

      {activeTab === 'scraping' && (
        <div className="space-y-6">
          <ScrapingControl />
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Scraping Moderne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Fonctionnalités du Scraping Moderne</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Détection automatique avec classification IA (Mistral)</li>
                    <li>• Géocodage précis avec Nominatim OpenStreetMap</li>
                    <li>• Scraping web avancé avec Firecrawl</li>
                    <li>• Vérification automatique des entreprises via API gouvernementale</li>
                    <li>• Déduplication intelligente des résultats</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Services intégrés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">Mistral AI</div>
                      <div className="text-sm text-blue-800">Classification intelligente</div>
                      <Badge className="mt-1 bg-green-100 text-green-800">✓ Configuré</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">Nominatim</div>
                      <div className="text-sm text-blue-800">Géocodage gratuit</div>
                      <Badge className="mt-1 bg-green-100 text-green-800">✓ Gratuit</Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">Firecrawl</div>
                      <div className="text-sm text-blue-800">Scraping web</div>
                      <Badge className="mt-1 bg-orange-100 text-orange-800">Clé requise</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedRepairerId(null);
          }}
          repairerId={selectedRepairerId}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
