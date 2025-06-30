
import React from 'react';
import { TabType } from './AdminNavigationTabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import SubscriptionsTable from '@/components/repairers/SubscriptionsTable';
import RepairersTable from '@/components/repairers/RepairersTable';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import AdBannerManagement from '@/components/advertising/AdBannerManagement';
import EnhancedScrapingHub from '@/components/scraping/EnhancedScrapingHub';
import BlogManagement from '@/components/blog/admin/BlogManagement';
import ChatbotManagement from '@/components/admin/ChatbotManagement';

interface AdminDashboardContentProps {
  activeTab: TabType;
  subscriptions: any[];
  repairers: any[];
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
  const renderContent = () => {
    switch (activeTab) {
      case 'subscriptions':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestion des Abonnements</CardTitle>
              <Button onClick={onRefresh} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent>
              <SubscriptionsTable subscriptions={subscriptions} />
            </CardContent>
          </Card>
        );

      case 'repairers':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestion des Réparateurs</CardTitle>
              <Button onClick={onRefresh} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent>
              <RepairersTable 
                repairers={repairers} 
                onViewProfile={onViewProfile}
              />
            </CardContent>
          </Card>
        );

      case 'interest':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Demandes d'Intérêt Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion des demandes d'intérêt à implémenter...
              </p>
            </CardContent>
          </Card>
        );

      case 'promocodes':
        return <PromoCodesManagement />;

      case 'advertising':
        return <AdBannerManagement />;

      case 'scraping':
        return <EnhancedScrapingHub />;

      case 'blog':
        return <BlogManagement />;

      case 'chatbot':
        return <ChatbotManagement />;

      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Sélectionnez un onglet pour voir le contenu.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

export default AdminDashboardContent;
