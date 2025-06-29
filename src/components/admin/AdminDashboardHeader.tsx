
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import DemoModeControl from '@/components/DemoModeControl';

interface AdminDashboardHeaderProps {
  onRefresh: () => void;
}

const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({ onRefresh }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backoffice Administrateur</h1>
          <p className="text-gray-600">Gestion de la plateforme RepairHub</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Demo Mode Control - Remplace le Client Access Control */}
      <DemoModeControl />
    </>
  );
};

export default AdminDashboardHeader;
