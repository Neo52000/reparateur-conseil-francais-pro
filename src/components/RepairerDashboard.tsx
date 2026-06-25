import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Euro,
  TrendingUp,
  Clock,
  Star,
  LogOut,
  Crown,
  ArrowUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import UpgradeModal from '@/components/UpgradeModal';
import AdBannerDisplay from '@/components/advertising/AdBannerDisplay';
import OverviewTabSection from './repairer-dashboard/OverviewTabSection';
import RepairerAppointmentsCalendar from './repairer-dashboard/RepairerAppointmentsCalendar';
import AnalyticsTabSection from './repairer-dashboard/AnalyticsTabSection';
import ProfileTabSection from './repairer-dashboard/ProfileTabSection';
import PricingTabSection from './repairer-dashboard/PricingTabSection';
import { RepairerOnboardingTour } from './repairer-dashboard/RepairerOnboardingTour';
import { useRepairerPlan } from '@/hooks/useRepairerPlan';

const RepairerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { currentPlan } = useRepairerPlan();

  const { shouldShowModal, isModalOpen, closeModal } = useUpgradeModal(user?.email || null);

  const repairerData = {
    profile: {
      name: 'top reparateurs.fr',
      rating: 4.9,
      totalRepairs: 156,
      joinDate: '2023-03-15',
    },
    stats: {
      monthlyRevenue: 3450,
      completedThisMonth: 24,
      avgRepairTime: 2.5,
    },
    appointments: [
      {
        id: '1',
        client: 'Paul Durand',
        time: '14:00',
        service: 'Diagnostic iPhone',
        phone: '+33 6 12 34 56 78',
      },
      {
        id: '2',
        client: 'Sophie Legrand',
        time: '16:30',
        service: 'Réparation écran',
        phone: '+33 6 98 76 54 32',
      },
    ],
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
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
    <div className="min-h-screen bg-background">
      <RepairerOnboardingTour />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {shouldShowModal && user?.email && (
          <UpgradeModal
            isOpen={isModalOpen}
            onClose={closeModal}
            userEmail={user.email}
          />
        )}

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/bdac6a2d-e8e5-46cb-b897-64a0a8383a78.png"
              alt="TopRéparateurs.fr"
              className="h-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Réparateur</h1>
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
                      : 'Vous bénéficiez des fonctionnalités avancées'}
                  </p>
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

        <div className="mb-6">
          <AdBannerDisplay placement="repairer_dashboard" className="mb-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Euro className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CA mensuel</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repairerData.stats.monthlyRevenue}€
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {repairerData.stats.completedThisMonth}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {repairerData.profile.rating}/5
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5" data-tour="dashboard-tabs">
            <TabsTrigger value="overview" data-tour="overview-tab">Aperçu</TabsTrigger>
            <TabsTrigger value="calendar">Planning</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs</TabsTrigger>
            <TabsTrigger value="analytics" data-tour="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile" data-tour="profile-progress">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTabSection
              orders={[]}
              appointments={repairerData.appointments}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Planning des rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RepairerAppointmentsCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <PricingTabSection />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTabSection avgRepairTime={repairerData.stats.avgRepairTime} />
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
