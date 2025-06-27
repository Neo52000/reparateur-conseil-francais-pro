
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
    return (
      <div className="space-y-6">
        <ScrapingControl />
        
        <Card>
          <CardHeader>
            <CardTitle>Configuration du Scraping Moderne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Fonctionnalités du Scraping Moderne</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Détection automatique avec classification IA (Mistral)</li>
                  <li>• Géocodage précis avec Nominatim OpenStreetMap</li>
                  <li>• Scraping web avancé avec Firecrawl</li>
                  <li>• Vérification automatique des entreprises via API gouvernementale</li>
                  <li>• Déduplication intelligente des résultats</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Services intégrés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">Mistral AI</div>
                    <div className="text-sm text-blue-800">Classification intelligente</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Configuré</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">Nominatim</div>
                    <div className="text-sm text-blue-800">Géocodage gratuit</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">✓ Gratuit</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-medium">Firecrawl</div>
                    <div className="text-sm text-blue-800">Scraping web</div>
                    <Badge className="mt-1 bg-orange-100 text-orange-800">Clé requise</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AdminDashboardContent;
