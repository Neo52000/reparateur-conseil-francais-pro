import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Package, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Euro,
  TrendingUp,
  Users,
  Clock,
  Star,
  LogOut,
  Crown,
  ArrowUp,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { supabase } from '@/integrations/supabase/client';
import UpgradeModal from '@/components/UpgradeModal';
import AdBannerDisplay from '@/components/advertising/AdBannerDisplay';
import DemoModeControl from '@/components/DemoModeControl';
import { useDemoMode } from '@/hooks/useDemoMode';
import OverviewTabSection from "./OverviewTabSection";
import OrdersTabSection from "./OrdersTabSection";
import CalendarTabSection from "./CalendarTabSection";
import InventoryTabSection from "./InventoryTabSection";
import AnalyticsTabSection from "./AnalyticsTabSection";
import BillingTabSection from "./BillingTabSection";
import ProfileTabSection from "./ProfileTabSection";
import PricingTabSection from "./PricingTabSection";

import DayView from "./calendar/DayView";
import AdvancedAnalytics from "./analytics/AdvancedAnalytics";
import InventoryManagement from "./inventory/InventoryManagement";
import NotificationCenter from "./notifications/NotificationCenter";
import LoyaltyProgram from "./loyalty/LoyaltyProgram";

const RepairerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPlan, setCurrentPlan] = useState('free');
  const { signOut, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Hook pour le mode démo - Simplifié
  const { demoModeEnabled } = useDemoMode();
  
  // Hook pour gérer le popup d'upgrade
  const { shouldShowModal, isModalOpen, closeModal } = useUpgradeModal(user?.email || null);

  console.log('🔍 RepairerDashboard - Rendu avec:', { 
    demoModeEnabled, 
    userId: user?.id,
    userEmail: user?.email,
    isAdmin 
  });

  // Données de base RÉELLES (sans aucune donnée de démo)
  const realData = {
    profile: {
      name: 'top reparateurs.fr',
      rating: 4.9,
      totalRepairs: 156,
      joinDate: '2023-03-15'
    },
    stats: {
      monthlyRevenue: 2850,
      pendingOrders: 3,
      completedThisMonth: 12,
      avgRepairTime: 3.2
    },
    orders: [
      {
        id: '1',
        client: 'Client Réel 1',
        device: 'iPhone 13',
        issue: 'Écran fissuré',
        status: 'En attente',
        priority: 'Normale',
        estimatedPrice: 150
      }
    ],
    inventory: [
      {
        id: '1',
        part: 'Écran iPhone 13',
        stock: 3,
        minStock: 2,
        price: 120
      }
    ],
    appointments: [
      {
        id: '1',
        client: 'Client Réel',
        time: '15:00',
        service: 'Réparation réelle',
        phone: '+33 6 00 00 00 00'
      }
    ]
  };

  // Données de démonstration
  const demoData = {
    stats: {
      monthlyRevenue: 5450,
      pendingOrders: 8,
      completedThisMonth: 24,
      avgRepairTime: 2.5
    },
    orders: [
      {
        id: 'demo-1',
        client: 'Jean Dupont (Démo)',
        device: 'iPhone 14 Pro',
        issue: 'Écran cassé',
        status: 'En cours',
        priority: 'Urgente',
        estimatedPrice: 180
      },
      {
        id: 'demo-2',
        client: 'Marie Martin (Démo)',
        device: 'Samsung Galaxy S23',
        issue: 'Batterie défaillante',
        status: 'Diagnostic',
        priority: 'Normale',
        estimatedPrice: 85
      },
      {
        id: 'demo-3',
        client: 'Pierre Durand (Démo)',
        device: 'iPad Air',
        issue: 'Problème de charge',
        status: 'Terminé',
        priority: 'Normale',
        estimatedPrice: 120
      }
    ],
    inventory: [
      {
        id: 'demo-inv-1',
        part: 'Écran iPhone 14 Pro (Démo)',
        stock: 5,
        minStock: 2,
        price: 150
      },
      {
        id: 'demo-inv-2',
        part: 'Batterie Samsung S23 (Démo)',
        stock: 1,
        minStock: 3,
        price: 65
      },
      {
        id: 'demo-inv-3',
        part: 'Connecteur Lightning (Démo)',
        stock: 0,
        minStock: 5,
        price: 25
      }
    ],
    appointments: [
      {
        id: 'demo-apt-1',
        client: 'Paul Durand (Démo)',
        time: '14:00',
        service: 'Diagnostic iPhone',
        phone: '+33 6 12 34 56 78'
      },
      {
        id: 'demo-apt-2',
        client: 'Sophie Legrand (Démo)',
        time: '16:30',
        service: 'Réparation écran',
        phone: '+33 6 98 76 54 32'
      },
      {
        id: 'demo-apt-3',
        client: 'Thomas Rousseau (Démo)',
        time: '10:00',
        service: 'Changement batterie',
        phone: '+33 6 11 22 33 44'
      }
    ]
  };

  // Logique simplifiée : choisir les données selon le mode démo
  const repairerData = demoModeEnabled ? {
    ...realData,
    stats: demoData.stats,
    orders: [...realData.orders, ...demoData.orders],
    inventory: [...realData.inventory, ...demoData.inventory],
    appointments: [...realData.appointments, ...demoData.appointments]
  } : realData;

  console.log('📊 RepairerDashboard - Données finales utilisées:', {
    demoModeEnabled,
    statsRevenue: repairerData.stats.monthlyRevenue,
    ordersCount: repairerData.orders.length,
    inventoryCount: repairerData.inventory.length,
    appointmentsCount: repairerData.appointments.length,
    orderTitles: repairerData.orders.map(o => o.client)
  });

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔄 RepairerDashboard - Fetching subscription for user:', user.id);
        console.log('🔄 RepairerDashboard - User email:', user.email);
        
        // Première tentative : chercher par user_id
        let { data, error } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier, subscribed, email, billing_cycle')
          .eq('user_id', user.id)
          .eq('subscribed', true)
          .maybeSingle();

        if (error) {
          console.error('❌ RepairerDashboard - Error fetching by user_id:', error);
        } else if (data) {
          console.log('✅ RepairerDashboard - Found subscription by user_id:', data);
          setCurrentPlan(data.subscription_tier || 'free');
          return;
        }

        // Deuxième tentative : chercher par repairer_id (string)
        const { data: data2, error: error2 } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier, subscribed, email, billing_cycle')
          .eq('repairer_id', user.id.toString())
          .eq('subscribed', true)
          .maybeSingle();

        if (error2) {
          console.error('❌ RepairerDashboard - Error fetching by repairer_id:', error2);
        } else if (data2) {
          console.log('✅ RepairerDashboard - Found subscription by repairer_id:', data2);
          setCurrentPlan(data2.subscription_tier || 'free');
          return;
        }

        // Troisième tentative : chercher par email
        if (user.email) {
          const { data: data3, error: error3 } = await supabase
            .from('repairer_subscriptions')
            .select('subscription_tier, subscribed, email, billing_cycle')
            .eq('email', user.email)
            .eq('subscribed', true)
            .maybeSingle();

          if (error3) {
            console.error('❌ RepairerDashboard - Error fetching by email:', error3);
          } else if (data3) {
            console.log('✅ RepairerDashboard - Found subscription by email:', data3);
            setCurrentPlan(data3.subscription_tier || 'free');
            return;
          }
        }

        console.log('⚠️ RepairerDashboard - No active subscription found, defaulting to free');
        setCurrentPlan('free');
        
      } catch (error) {
        console.error('❌ RepairerDashboard - Exception fetching subscription:', error);
        setCurrentPlan('free');
      }
    };

    fetchCurrentPlan();
  }, [user?.id, user?.email]);

  const handleLogout = async () => {
    console.log('🔄 Starting logout process...');
    try {
      await signOut();
      console.log('✅ Logout completed, redirecting to home...');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      navigate('/', { replace: true });
    }
  };

  const handleUpgradePlan = () => {
    navigate('/repairer/plans');
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'Basique';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Gratuit';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'border-l-blue-500';
      case 'premium':
        return 'border-l-purple-500';
      case 'enterprise':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Modal */}
        {shouldShowModal && user?.email && (
          <UpgradeModal
            isOpen={isModalOpen}
            onClose={closeModal}
            userEmail={user.email}
          />
        )}

        {/* Top bar with logo, title and logout button */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/bdac6a2d-e8e5-46cb-b897-64a0a8383a78.png"
              alt="TopRéparateurs.fr"
              className="h-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Réparateur</h1>
              {demoModeEnabled && (
                <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
                  Mode Démonstration
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="self-end flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </Button>
        </div>

        {/* Contrôle du mode démo pour les admins */}
        {isAdmin && (
          <div className="mb-6">
            <DemoModeControl />
          </div>
        )}

        {/* Plan actuel et bandeau d'upgrade avec debug info */}
        <Card className={`mb-6 border-l-4 ${getPlanColor(currentPlan)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Plan actuel : {getPlanDisplayName(currentPlan)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentPlan === 'free' 
                      ? 'Passez à un plan payant pour accéder à plus de fonctionnalités'
                      : 'Vous bénéficiez des fonctionnalités avancées'
                    }
                  </p>
                  {user?.email === 'demo@demo.fr' && (
                    <p className="text-xs text-blue-600 mt-1">
                      Debug: User ID = {user.id} | Email = {user.email} | Plan = {currentPlan}
                    </p>
                  )}
                </div>
              </div>
              {currentPlan === 'free' && (
                <Button onClick={handleUpgradePlan} className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4" />
                  Changer de plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bannière publicitaire pour les réparateurs - sous l'affichage du plan */}
        <div className="mb-6">
          <AdBannerDisplay 
            placement="repairer_dashboard" 
            className="mb-4"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Euro className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CA mensuel</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.monthlyRevenue}€</p>
                  {demoModeEnabled && (
                    <p className="text-xs text-blue-600">Donnée de démo</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.pendingOrders}</p>
                  {demoModeEnabled && (
                    <p className="text-xs text-blue-600">Donnée de démo</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Réparations ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.completedThisMonth}</p>
                  {demoModeEnabled && (
                    <p className="text-xs text-blue-600">Donnée de démo</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.profile.rating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="calendar">Planning</TabsTrigger>
            <TabsTrigger value="inventory">Stock</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTabSection
              orders={repairerData.orders}
              appointments={repairerData.appointments}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTabSection orders={repairerData.orders} />
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-6">
              <CalendarTabSection />
              <Card>
                <CardHeader>
                  <CardTitle>Vue détaillée du planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <DayView
                    selectedDate={new Date()}
                    appointments={repairerData.appointments.map(apt => ({
                      id: apt.id,
                      appointment_date: new Date().toISOString(),
                      duration_minutes: 60,
                      client_name: apt.client,
                      service: apt.service,
                      status: 'scheduled'
                    }))}
                    onAppointmentClick={(apt) => console.log('Appointment clicked:', apt)}
                    onTimeSlotClick={(time) => console.log('Time slot clicked:', time)}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement 
              inventory={repairerData.inventory}
              demoModeEnabled={demoModeEnabled}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingTabSection />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <AnalyticsTabSection avgRepairTime={repairerData.stats.avgRepairTime} />
              <AdvancedAnalytics demoModeEnabled={demoModeEnabled} />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter demoModeEnabled={demoModeEnabled} />
          </TabsContent>

          <TabsContent value="loyalty">
            <LoyaltyProgram demoModeEnabled={demoModeEnabled} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTabSection />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTabSection profileData={repairerData.profile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepairerDashboard;
