
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

interface RepairerDashboardHeaderProps {
  onLogout: () => void;
}

const RepairerDashboardHeader: React.FC<RepairerDashboardHeaderProps> = ({
  onLogout
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <img
          src="/lovable-uploads/bdac6a2d-e8e5-46cb-b897-64a0a8383a78.png"
          alt="TopRéparateurs.fr"
          className="h-16 object-contain"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Réparateur</h1>
        </div>
      </div>
      <Button
        onClick={onLogout}
        variant="outline"
        className="self-end flex items-center gap-2 border-orange-600 text-orange-600 hover:bg-orange-50"
      >
        <LogOut className="h-5 w-5" />
        <span>Déconnexion</span>
      </Button>
    </div>
  );
};

export default RepairerDashboardHeader;
