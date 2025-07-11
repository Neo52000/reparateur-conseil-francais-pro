
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { supabase } from '@/integrations/supabase/client';
import UpgradeModal from '@/components/UpgradeModal';
import AdBannerDisplay from '@/components/advertising/AdBannerDisplay';
import DemoModeControl from '@/components/DemoModeControl';
import { useDemoMode } from '@/hooks/useDemoMode';
import RepairerDashboardHeader from './RepairerDashboardHeader';
import RepairerDashboardStats from './RepairerDashboardStats';
import RepairerDashboardPlanCard from './RepairerDashboardPlanCard';
import RepairerDashboardTabs from './RepairerDashboardTabs';

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

        <RepairerDashboardHeader 
          onLogout={handleLogout}
          demoModeEnabled={demoModeEnabled}
        />

        {/* Contrôle du mode démo pour les admins */}
        {isAdmin && (
          <div className="mb-6">
            <DemoModeControl />
          </div>
        )}

        <RepairerDashboardPlanCard
          currentPlan={currentPlan}
          userEmail={user?.email}
          userId={user?.id}
          onUpgradePlan={handleUpgradePlan}
        />

        {/* Bannière publicitaire pour les réparateurs */}
        <div className="mb-6">
          <AdBannerDisplay 
            placement="repairer_dashboard" 
            className="mb-4"
          />
        </div>

        <RepairerDashboardStats
          stats={repairerData.stats}
          profile={repairerData.profile}
          demoModeEnabled={demoModeEnabled}
        />

        <RepairerDashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orders={repairerData.orders}
          appointments={repairerData.appointments}
          inventory={repairerData.inventory}
          profileData={repairerData.profile}
          avgRepairTime={repairerData.stats.avgRepairTime}
          demoModeEnabled={demoModeEnabled}
        />
      </div>
    </div>
  );
};

export default RepairerDashboard;
