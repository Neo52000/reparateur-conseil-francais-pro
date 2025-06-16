import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, Zap, Users, TrendingUp, RefreshCw, Plus, Edit, Percent } from 'lucide-react';
import ScrapingControl from './ScrapingControl';
import ClientAccessControl from './ClientAccessControl';
import PromoCodesManagement from './PromoCodesManagement';

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

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [repairers, setRepairers] = useState<RepairerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'repairers' | 'scraping' | 'promocodes'>('subscriptions');
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRepairers: 0,
    activeRepairers: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSubscriptions(), fetchRepairers()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_subscription_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      
      // Calculate subscription stats
      const total = data?.length || 0;
      const active = data?.filter(sub => sub.subscribed).length || 0;
      const monthlyRev = data?.reduce((sum, sub) => {
        if (sub.subscribed && sub.billing_cycle === 'monthly') {
          return sum + (sub.price_monthly || 0);
        }
        return sum;
      }, 0) || 0;
      const yearlyRev = data?.reduce((sum, sub) => {
        if (sub.subscribed && sub.billing_cycle === 'yearly') {
          return sum + (sub.price_yearly || 0);
        }
        return sum;
      }, 0) || 0;

      setStats(prev => ({
        ...prev,
        totalSubscriptions: total,
        activeSubscriptions: active,
        monthlyRevenue: monthlyRev,
        yearlyRevenue: yearlyRev
      }));

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchRepairers = async () => {
    try {
      console.log('Fetching repairers from Supabase...');
      
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw repairers data from Supabase:', data);

      if (!data || data.length === 0) {
        console.log('No repairers found in database');
        setRepairers([]);
        setStats(prev => ({
          ...prev,
          totalRepairers: 0,
          activeRepairers: 0
        }));
        return;
      }

      // Convertir les données de la table repairers vers le format RepairerData
      const repairersData: RepairerData[] = data.map(repairer => ({
        id: repairer.id,
        name: repairer.name,
        email: repairer.email || 'Non renseigné',
        phone: repairer.phone || 'Non renseigné',
        city: repairer.city,
        subscription_tier: 'free', // Par défaut, à améliorer avec une vraie liaison
        subscribed: false, // Par défaut, à améliorer avec une vraie liaison
        total_repairs: 0, // À calculer depuis une table de réparations
        rating: repairer.rating || 0,
        created_at: repairer.created_at
      }));

      console.log('Processed repairers data:', repairersData);
      setRepairers(repairersData);
      
      const totalRepairers = repairersData.length;
      const activeRepairers = repairersData.filter(r => r.subscribed).length;
      
      setStats(prev => ({
        ...prev,
        totalRepairers,
        activeRepairers
      }));

    } catch (error) {
      console.error('Error fetching repairers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réparateurs",
        variant: "destructive"
      });
    }
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
          Scraping IA
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
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
                  {subscriptions.map((subscription) => {
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestion des Réparateurs</CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un réparateur
            </Button>
          </CardHeader>
          <CardContent>
            {repairers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun réparateur trouvé</p>
                <p className="text-sm text-gray-400 mt-2">
                  Les réparateurs scrapés ou ajoutés manuellement apparaîtront ici
                </p>
                <Button onClick={fetchData} className="mt-4" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser les données
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Réparations</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairers.map((repairer) => {
                    const tierInfo = getTierInfo(repairer.subscription_tier);
                    return (
                      <TableRow key={repairer.id}>
                        <TableCell className="font-medium">{repairer.name}</TableCell>
                        <TableCell>{repairer.email}</TableCell>
                        <TableCell>{repairer.phone}</TableCell>
                        <TableCell>{repairer.city}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {tierInfo.icon}
                            <Badge className={tierInfo.color}>
                              {tierInfo.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{repairer.total_repairs}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{repairer.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
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

      {activeTab === 'promocodes' && <PromoCodesManagement />}

      {activeTab === 'scraping' && (
        <div className="space-y-6">
          <ScrapingControl />
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Scraping IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Fonctionnalités du Scraping IA</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Détection automatique de nouveaux réparateurs</li>
                    <li>• Analyse IA des informations de contact et services</li>
                    <li>• Détection des établissements fermés définitivement</li>
                    <li>• Classification automatique des services proposés</li>
                    <li>• Mise à jour des informations existantes</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-2">Configuration requise</h3>
                  <p className="text-sm text-orange-800">
                    Pour utiliser cette fonctionnalité, une clé API OpenAI est nécessaire pour l'analyse IA des données scrapées.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
