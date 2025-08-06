
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Star, 
  Zap, 
  Settings, 
  TrendingUp, 
  Users, 
  Eye,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionPlans from './SubscriptionPlans';

interface Subscription {
  id: string;
  subscription_tier: string;
  billing_cycle: string;
  subscribed: boolean;
  subscription_end?: string;
}

const PartnerDashboard = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [stats] = useState({
    views: 1247,
    contacts: 23,
    quotes: 8,
  });

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    // For demo purposes, we'll simulate a subscription
    setSubscription({
      id: '1',
      subscription_tier: 'basic',
      billing_cycle: 'monthly',
      subscribed: true,
    });
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
        return { name: 'Gratuit', color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  if (showPlans) {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowPlans(false)}
          >
            ← Retour au tableau de bord
          </Button>
        </div>
        <SubscriptionPlans />
      </div>
    );
  }

  const tierInfo = getTierInfo(subscription?.subscription_tier || 'free');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord partenaire</h1>
          <p className="text-gray-600">Gérez votre profil et votre abonnement</p>
        </div>
        <Button onClick={() => setShowPlans(true)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Gérer l'abonnement
        </Button>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Abonnement actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {tierInfo.icon}
              <div>
                <Badge className={tierInfo.color}>
                  {tierInfo.name}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {subscription?.billing_cycle === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowPlans(true)}>
              Changer de plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vues du profil</p>
                <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contacts reçus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacts}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Devis demandés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.quotes}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+25% ce mois</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features based on subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${subscription?.subscription_tier !== 'free' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={subscription?.subscription_tier !== 'free' ? 'text-gray-900' : 'text-gray-500'}>
                Informations de contact visibles
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${['premium', 'enterprise'].includes(subscription?.subscription_tier || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={['premium', 'enterprise'].includes(subscription?.subscription_tier || '') ? 'text-gray-900' : 'text-gray-500'}>
                Demandes de devis
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${['premium', 'enterprise'].includes(subscription?.subscription_tier || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={['premium', 'enterprise'].includes(subscription?.subscription_tier || '') ? 'text-gray-900' : 'text-gray-500'}>
                Référencement optimisé
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${subscription?.subscription_tier === 'enterprise' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={subscription?.subscription_tier === 'enterprise' ? 'text-gray-900' : 'text-gray-500'}>
                Publicité Facebook & réseaux sociaux
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboard;
