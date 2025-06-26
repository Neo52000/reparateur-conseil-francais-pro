import React, { useState } from 'react';
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
  ArrowUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import UpgradeModal from '@/components/UpgradeModal';
import OverviewTabSection from "./repairer-dashboard/OverviewTabSection";
import OrdersTabSection from "./repairer-dashboard/OrdersTabSection";
import CalendarTabSection from "./repairer-dashboard/CalendarTabSection";
import InventoryTabSection from "./repairer-dashboard/InventoryTabSection";
import AnalyticsTabSection from "./repairer-dashboard/AnalyticsTabSection";
import BillingTabSection from "./repairer-dashboard/BillingTabSection";
import ProfileTabSection from "./repairer-dashboard/ProfileTabSection";

const RepairerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  // Hook pour gérer le popup d'upgrade
  const { shouldShowModal, isModalOpen, closeModal } = useUpgradeModal(user?.email || null);

  // Données mockées pour la démo
  const repairerData = {
    profile: {
      name: 'TechRepair Pro',
      rating: 4.9,
      totalRepairs: 156,
      joinDate: '2023-03-15'
    },
    stats: {
      monthlyRevenue: 3450,
      pendingOrders: 8,
      completedThisMonth: 24,
      avgRepairTime: 2.5
    },
    orders: [
      {
        id: '1',
        client: 'Jean Dupont',
        device: 'iPhone 14 Pro',
        issue: 'Écran cassé',
        status: 'En cours',
        priority: 'Urgente',
        estimatedPrice: 180
      },
      {
        id: '2',
        client: 'Marie Martin',
        device: 'Samsung Galaxy S23',
        issue: 'Batterie',
        status: 'Diagnostic',
        priority: 'Normale',
        estimatedPrice: 85
      }
    ],
    inventory: [
      {
        id: '1',
        part: 'Écran iPhone 14 Pro',
        stock: 5,
        minStock: 2,
        price: 150
      },
      {
        id: '2',
        part: 'Batterie Samsung S23',
        stock: 1,
        minStock: 3,
        price: 65
      }
    ],
    appointments: [
      {
        id: '1',
        client: 'Paul Durand',
        time: '14:00',
        service: 'Diagnostic iPhone',
        phone: '+33 6 12 34 56 78'
      },
      {
        id: '2',
        client: 'Sophie Legrand',
        time: '16:30',
        service: 'Réparation écran',
        phone: '+33 6 98 76 54 32'
      }
    ]
  };

  const handleLogout = async () => {
    console.log('🔄 Starting logout process...');
    try {
      await signOut();
      console.log('✅ Logout completed, redirecting...');
      navigate('/repairer/auth', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force la redirection même en cas d'erreur
      navigate('/repairer/auth', { replace: true });
    }
  };

  const handleUpgradePlan = () => {
    navigate('/repairer/plans');
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

        {/* Top bar with title, name and logout button */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Réparateur</h1>
            <p className="text-gray-600 mt-2">{repairerData.profile.name}</p>
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

        {/* Plan actuel et bandeau d'upgrade */}
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Plan actuel : Gratuit</h3>
                  <p className="text-sm text-gray-600">
                    Passez à un plan payant pour accéder à plus de fonctionnalités
                  </p>
                </div>
              </div>
              <Button onClick={handleUpgradePlan} className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                Changer de plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Euro className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CA mensuel</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.monthlyRevenue}€</p>
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="calendar">Planning</TabsTrigger>
            <TabsTrigger value="inventory">Stock</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
            <CalendarTabSection />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTabSection inventory={repairerData.inventory} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTabSection avgRepairTime={repairerData.stats.avgRepairTime} />
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
