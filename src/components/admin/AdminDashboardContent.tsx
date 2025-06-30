
import React from 'react';
import SubscriptionsTable from '@/components/repairers/SubscriptionsTable';
import RepairersTable from '@/components/repairers/RepairersTable';
import PromoCodesManagement from '@/components/PromoCodesManagement';
import ScrapingOperations from '@/components/scraping/ScrapingOperations';
import ClientInterestManagement from '@/components/ClientInterestManagement';
import AdminAuditExample from '@/components/admin/AdminAuditExample';
import { TabType } from './AdminNavigationTabs';

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
          <SubscriptionsTable 
            subscriptions={subscriptions}
            onRefresh={onRefresh}
          />
        );
      
      case 'repairers':
        return (
          <RepairersTable 
            repairers={repairers}
            onViewProfile={onViewProfile}
            onRefresh={onRefresh}
          />
        );
      
      case 'promo-codes':
        return <PromoCodesManagement />;
      
      case 'scraping':
        return <ScrapingOperations onRefresh={onRefresh} />;
      
      case 'client-interests':
        return <ClientInterestManagement />;
      
      case 'audit-demo':
        return (
          <div className="space-y-6">
            <AdminAuditExample />
            <div className="text-sm text-muted-foreground">
              <p>
                Cette section permet de tester les fonctionnalités d'audit. 
                Chaque action effectuée ici sera automatiquement enregistrée dans le système d'audit 
                et sera visible dans l'onglet "Logs d'audit" et dans les statistiques.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Sélectionnez un onglet pour afficher le contenu correspondant.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default AdminDashboardContent;
