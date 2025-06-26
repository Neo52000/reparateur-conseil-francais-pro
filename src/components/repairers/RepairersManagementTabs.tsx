
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RepairersTable from './RepairersTable';
import SubscriptionsTable from './SubscriptionsTable';
import PromoCodesManagement from '../PromoCodesManagement';

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
  onViewProfile: (repairerId: string) => void;
  onRefresh: () => void;
}

const RepairersManagementTabs: React.FC<RepairersManagementTabsProps> = ({
  repairers,
  subscriptions,
  onViewProfile,
  onRefresh
}) => {
  return (
    <Tabs defaultValue="repairers" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="repairers">Réparateurs</TabsTrigger>
        <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
        <TabsTrigger value="promocodes">Codes Promo</TabsTrigger>
      </TabsList>

      <TabsContent value="repairers">
        <RepairersTable 
          repairers={repairers} 
          onViewProfile={onViewProfile}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="subscriptions">
        <SubscriptionsTable 
          subscriptions={subscriptions}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="promocodes">
        <PromoCodesManagement />
      </TabsContent>
    </Tabs>
  );
};

export default RepairersManagementTabs;
