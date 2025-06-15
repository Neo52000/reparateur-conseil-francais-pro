
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Edit } from 'lucide-react';

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

interface SubscriptionsTableProps {
  subscriptions: SubscriptionData[];
}

const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ subscriptions }) => {
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

  return (
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
  );
};

export default SubscriptionsTable;
