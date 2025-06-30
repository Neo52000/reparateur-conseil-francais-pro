
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Subscription {
  id: string;
  email: string;
  subscription_tier: string;
  subscribed: boolean;
  created_at: string;
  repairer_id: string;
  plan_name?: string;
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  onRefresh: () => void;
}

const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ subscriptions, onRefresh }) => {
  const { logSubscriptionAction } = useAdminAuditIntegration();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleApproveSubscription = async (subscription: Subscription) => {
    setLoading(subscription.id);
    try {
      // Simuler l'approbation de l'abonnement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logSubscriptionAction('approve', subscription.id, {
        previous_status: subscription.subscribed ? 'active' : 'inactive',
        new_status: 'active',
        plan: subscription.subscription_tier,
        approval_reason: 'Manual admin approval',
        repairer_email: subscription.email
      }, 'info');

      toast({
        title: "Abonnement approuvé",
        description: `L'abonnement de ${subscription.email} a été approuvé`,
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'abonnement",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSuspendSubscription = async (subscription: Subscription) => {
    setLoading(subscription.id);
    try {
      // Simuler la suspension de l'abonnement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logSubscriptionAction('deactivate', subscription.id, {
        previous_status: 'active',
        new_status: 'suspended',
        plan: subscription.subscription_tier,
        suspension_reason: 'Admin action - policy violation',
        repairer_email: subscription.email
      }, 'warning');

      toast({
        title: "Abonnement suspendu",
        description: `L'abonnement de ${subscription.email} a été suspendu`,
        variant: "destructive"
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'abonnement",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'premium': return 'default';
      case 'pro': return 'secondary';
      case 'free': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                {subscription.email}
              </TableCell>
              <TableCell>
                <Badge variant={getTierBadgeVariant(subscription.subscription_tier)}>
                  {subscription.plan_name || subscription.subscription_tier}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {subscription.subscribed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">Actif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-700">Inactif</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {new Date(subscription.created_at).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {!subscription.subscribed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveSubscription(subscription)}
                      disabled={loading === subscription.id}
                    >
                      {loading === subscription.id ? 'Traitement...' : 'Approuver'}
                    </Button>
                  )}
                  {subscription.subscribed && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleSuspendSubscription(subscription)}
                      disabled={loading === subscription.id}
                    >
                      {loading === subscription.id ? 'Traitement...' : 'Suspendre'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubscriptionsTable;
