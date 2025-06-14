
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  repairer_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscribed: boolean;
  subscription_tier: string | null;
  billing_cycle: string | null;
  subscription_end: string | null;
  plan_name: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0,
    thisMonth: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_subscription_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const active = data?.filter(sub => sub.subscribed).length || 0;
      const revenue = data?.reduce((sum, sub) => {
        if (sub.subscribed && sub.price_monthly) {
          return sum + (sub.billing_cycle === 'yearly' ? sub.price_yearly || 0 : sub.price_monthly);
        }
        return sum;
      }, 0) || 0;
      
      const thisMonth = data?.filter(sub => {
        const created = new Date(sub.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0;

      setStats({ total, active, revenue, thisMonth });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les abonnements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return <Badge variant="outline">Aucun</Badge>;
    
    const variants = {
      'basic': 'secondary',
      'premium': 'default',
      'enterprise': 'destructive',
    } as const;
    
    return <Badge variant={variants[tier as keyof typeof variants] || 'outline'}>{tier}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backoffice Admin</h1>
        <p className="text-gray-600">Gestion des abonnements partenaires</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partenaires</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abonnés Actifs</p>
                <p className="text-2xl font-bold">{stats.active}</p>
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
                <p className="text-2xl font-bold">{stats.revenue.toFixed(2)}€</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements des Partenaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partenaire</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Facturation</TableHead>
                <TableHead>Fin d'abonnement</TableHead>
                <TableHead>Prix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    {sub.first_name || sub.last_name 
                      ? `${sub.first_name || ''} ${sub.last_name || ''}`.trim()
                      : sub.repairer_id}
                  </TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{getTierBadge(sub.subscription_tier)}</TableCell>
                  <TableCell>
                    <Badge variant={sub.subscribed ? 'default' : 'secondary'}>
                      {sub.subscribed ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.billing_cycle || 'N/A'}</TableCell>
                  <TableCell>{formatDate(sub.subscription_end)}</TableCell>
                  <TableCell>
                    {sub.price_monthly 
                      ? `${sub.billing_cycle === 'yearly' ? sub.price_yearly : sub.price_monthly}€`
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
