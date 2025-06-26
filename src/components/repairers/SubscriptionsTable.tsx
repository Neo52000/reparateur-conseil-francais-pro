
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  onRefresh?: () => void;
}

const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ subscriptions, onRefresh }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

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

  const handleToggleSubscription = async (subscriptionId: string, currentStatus: boolean) => {
    setLoading(subscriptionId);
    try {
      console.log('🔄 Toggling subscription status for:', subscriptionId, 'to:', !currentStatus);
      
      const { error } = await supabase
        .from('repairer_subscriptions')
        .update({ 
          subscribed: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('❌ Error toggling subscription:', error);
        throw error;
      }

      console.log('✅ Subscription status updated successfully');
      
      toast({
        title: "Succès",
        description: `Abonnement ${!currentStatus ? 'activé' : 'suspendu'} avec succès`
      });
      
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error('❌ Error in handleToggleSubscription:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'abonnement",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    setLoading(subscriptionId);
    try {
      console.log('🗑️ Deleting subscription:', subscriptionId);
      
      const { error } = await supabase
        .from('repairer_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) {
        console.error('❌ Error deleting subscription:', error);
        throw error;
      }

      console.log('✅ Subscription deleted successfully');
      
      toast({
        title: "Succès",
        description: "Abonnement supprimé avec succès"
      });
      
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error('❌ Error in handleDeleteSubscription:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'abonnement",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
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
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Fin d'abonnement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Aucun abonnement trouvé
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => {
                const tierInfo = getTierInfo(subscription.subscription_tier);
                const price = subscription.billing_cycle === 'yearly' 
                  ? subscription.price_yearly 
                  : subscription.price_monthly;
                
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
                      {price ? `${price}€` : 'N/A'}
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
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleSubscription(subscription.id, subscription.subscribed)}
                          disabled={loading === subscription.id}
                          title={subscription.subscribed ? 'Suspendre l\'abonnement' : 'Activer l\'abonnement'}
                        >
                          {subscription.subscribed ? 
                            <XCircle className="h-4 w-4" /> : 
                            <CheckCircle className="h-4 w-4" />
                          }
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={loading === subscription.id}
                          title="Modifier l'abonnement"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={loading === subscription.id}
                              title="Supprimer l'abonnement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSubscription(subscription.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsTable;
