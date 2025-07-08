
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TabType = 'subscriptions' | 'repairers' | 'promo-codes' | 'scraping' | 'client-interests' | 'audit-demo' | 'subdomains';

interface AdminNavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const AdminNavigationTabs: React.FC<AdminNavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
        <TabsTrigger value="repairers">Réparateurs</TabsTrigger>
        <TabsTrigger value="subdomains">Sous-domaines</TabsTrigger>
        <TabsTrigger value="promo-codes">Codes Promo</TabsTrigger>
        <TabsTrigger value="scraping">Scraping</TabsTrigger>
        <TabsTrigger value="client-interests">Demandes</TabsTrigger>
        <TabsTrigger value="audit-demo">Audit Test</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AdminNavigationTabs;
