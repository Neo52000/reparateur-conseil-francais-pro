
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Star, Zap, Users, TrendingUp, RefreshCw, Plus, Edit, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '@/components/SubscriptionPlans';

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

const RepairersManagementPage = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [repairers, setRepairers] = useState<RepairerData[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Mock data for repairers - in real app, this would come from a repairers table
      const mockRepairers: RepairerData[] = [
        {
          id: 'test-repairer-001',
          name: 'TechRepair Pro',
          email: 'tech@repair.fr',
          phone: '+33 1 23 45 67 89',
          city: 'Paris',
          subscription_tier: 'premium',
          subscribed: true,
          total_repairs: 156,
          rating: 4.9,
          created_at: '2023-01-15T10:00:00Z'
        },
        {
          id: 'test-repairer-002',
          name: 'Mobile Fix Express',
          email: 'contact@mobilefix.fr',
          phone: '+33 1 98 76 54 32',
          city: 'Lyon',
          subscription_tier: 'basic',
          subscribed: true,
          total_repairs: 89,
          rating: 4.5,
          created_at: '2023-02-20T14:30:00Z'
        },
        {
          id: 'test-repairer-003',
          name: 'Smartphone Clinic',
          email: 'info@smartphoneclinic.fr',
          phone: '+33 1 11 22 33 44',
          city: 'Marseille',
          subscription_tier: 'free',
          subscribed: false,
          total_repairs: 23,
          rating: 4.2,
          created_at: '2023-03-10T09:15:00Z'
        }
      ];

      setRepairers(mockRepairers);
      
      const totalRepairers = mockRepairers.length;
      const activeRepairers = mockRepairers.filter(r => r.subscribed).length;
      
      setStats(prev => ({
        ...prev,
        totalRepairers,
        activeRepairers
      }));

    } catch (error) {
      console.error('Error fetching repairers:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestion des Réparateurs</h1>
                <p className="text-sm text-gray-600">
                  Administration des réparateurs et abonnements
                </p>
              </div>
            </div>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Tabs for different sections */}
        <Tabs defaultValue="repairers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="repairers">Réparateurs</TabsTrigger>
            <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
            <TabsTrigger value="plans">Plans d'abonnement</TabsTrigger>
          </TabsList>

          <TabsContent value="repairers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestion des Réparateurs</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un réparateur
                </Button>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Abonnements</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Plans d'abonnement</CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionPlans />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RepairersManagementPage;
