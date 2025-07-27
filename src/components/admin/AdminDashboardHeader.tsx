
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';


interface AdminDashboardHeaderProps {
  onRefresh: () => void;
}

const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-electric-blue">Backoffice Administrateur</h1>
          <p className="text-muted-foreground">Gestion de la plateforme RepairHub</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
