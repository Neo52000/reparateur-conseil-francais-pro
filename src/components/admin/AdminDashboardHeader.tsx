import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AdminDashboardHeaderProps {
  onRefresh: () => void;
}

export const AdminDashboardHeader: FC<AdminDashboardHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-primary">Backoffice Administrateur</h1>
        <p className="text-muted-foreground mt-1">Gestion de la plateforme RepairHub</p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualiser
      </Button>
    </div>
  );
};

export default AdminDashboardHeader;
