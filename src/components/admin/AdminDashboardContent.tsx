
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrapingControl from '@/components/ScrapingControl';
import ClientInterestManagement from '@/components/ClientInterestManagement';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import AdBannerManagement from '@/components/advertising/AdBannerManagement';
import SubscriptionsTable from '@/components/repairers/SubscriptionsTable';
import RepairersTable from '@/components/repairers/RepairersTable';
import type { TabType } from './AdminNavigationTabs';

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

interface AdminDashboardContentProps {
  activeTab: TabType;
  subscriptions: SubscriptionData[];
  repairers: RepairerData[];
  onViewProfile: (repairerId: string) => void;
  onRefresh: () => void;
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  activeTab,
  subscriptions,
  repairers,
  onViewProfile,
  onRefresh
}) => {
  if (activeTab === 'subscriptions') {
    return (
      <SubscriptionsTable 
        subscriptions={subscriptions}
        onRefresh={onRefresh}
      />
    );
  }

  if (activeTab === 'repairers') {
    return (
      <RepairersTable
        repairers={repairers}
        onViewProfile={onViewProfile}
        onRefresh={onRefresh}
      />
    );
  }

  if (activeTab === 'interest') {
    return <ClientInterestManagement />;
  }

  if (activeTab === 'promocodes') {
    return <PromoCodesManagement />;
  }

  if (activeTab === 'advertising') {
    return <AdBannerManagement />;
  }

  if (activeTab === 'scraping') {
    return <ScrapingControl />;
  }

  return null;
};

export default AdminDashboardContent;
