
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RepairersTable from './RepairersTable';
import SubscriptionsTable from './SubscriptionsTable';
import CategoriesManagement from '../catalog/CategoriesManagement';
import RepairerSeoManagement from '../admin/RepairerSeoManagement';
import RepairersDashboard from '../admin/RepairersDashboard';
import RepairersAnalytics from '../admin/RepairersAnalytics';
import { SuppliersDirectoryManagement } from '../admin/SuppliersDirectoryManagement';

interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

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

interface RepairersManagementTabsProps {
  repairers: RepairerData[];
  subscriptions: SubscriptionData[];
  stats: {
    totalRepairers: number;
    activeRepairers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalRevenue: number;
    totalInterests: number;
  };
  onViewProfile: (repairerId: string) => void;
  onRefresh: () => void;
}

const RepairersManagementTabs: React.FC<RepairersManagementTabsProps> = ({
  repairers,
  subscriptions,
  stats,
  onViewProfile,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = React.useState('repairers');

  const handleSeoOptimize = () => {
    setActiveTab('seo-local');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="repairers">Réparateurs</TabsTrigger>
        <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="categories">Catégories</TabsTrigger>
        <TabsTrigger value="suppliers" disabled className="opacity-50 cursor-not-allowed">
          Fournisseurs (Bientôt)
        </TabsTrigger>
        <TabsTrigger value="seo-local">SEO Local</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <RepairersDashboard 
          stats={stats}
          repairers={repairers}
        />
      </TabsContent>

      <TabsContent value="repairers">
        <RepairersTable 
          repairers={repairers} 
          onViewProfile={onViewProfile}
          onRefresh={onRefresh}
          onSeoOptimize={handleSeoOptimize}
        />
      </TabsContent>

      <TabsContent value="subscriptions">
        <SubscriptionsTable 
          subscriptions={subscriptions}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="analytics">
        <RepairersAnalytics 
          repairers={repairers}
          subscriptions={subscriptions}
        />
      </TabsContent>

      <TabsContent value="categories">
        <CategoriesManagement />
      </TabsContent>

      <TabsContent value="suppliers">
        <SuppliersDirectoryManagement />
      </TabsContent>

      <TabsContent value="seo-local">
        <RepairerSeoManagement />
      </TabsContent>
    </Tabs>
  );
};

export default RepairersManagementTabs;
