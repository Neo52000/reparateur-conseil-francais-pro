import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';

interface SubscriptionsManagementProps {
  subscriptions?: any[];
  repairers?: any[];
  onRefresh?: () => void;
}

const SubscriptionsManagement: React.FC<SubscriptionsManagementProps> = ({
  subscriptions = [],
  repairers = [],
  onRefresh
}) => {
  // Calcul des statistiques
  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.subscribed).length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + (s.price_monthly || 0), 0),
    conversionRate: repairers.length > 0 ? (subscriptions.length / repairers.length * 100).toFixed(1) : 0
  };

  const getSubscriptionBadge = (tier: string) => {
    const variants = {
      'free': 'bg-muted text-muted-foreground',
      'basic': 'bg-admin-blue-light text-admin-blue',
      'pro': 'bg-admin-purple-light text-admin-purple',
      'premium': 'bg-admin-yellow-light text-admin-yellow'
    };
    return variants[tier as keyof typeof variants] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Abonnements</h2>
          <p className="text-muted-foreground">Suivi des abonnements et revenus réparateurs</p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-admin-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Abonnements</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-admin-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-admin-purple" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Revenus Mensuels</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRevenue}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-admin-orange" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Taux Conversion</p>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Abonnements</CardTitle>
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
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    {subscription.first_name} {subscription.last_name}
                  </TableCell>
                  <TableCell>{subscription.email}</TableCell>
                  <TableCell>
                    <Badge className={getSubscriptionBadge(subscription.subscription_tier)}>
                      {subscription.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{subscription.billing_cycle}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                      {subscription.subscribed ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(subscription.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {subscriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun abonnement trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsManagement;