
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TestTube } from 'lucide-react';

interface ClientDashboardHeaderProps {
  firstName?: string;
  demoModeEnabled: boolean;
}

const ClientDashboardHeader = ({ firstName, demoModeEnabled }: ClientDashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour {firstName || 'Client'} 👋
        </h1>
        <p className="text-gray-600">
          Gérez vos réparations et suivez vos appareils
        </p>
      </div>
      <div className="flex items-center gap-2">
        {demoModeEnabled && (
          <Badge variant="outline" className="flex items-center gap-1">
            <TestTube className="h-3 w-3" />
            Mode Démo
          </Badge>
        )}
        <Badge variant="secondary" className="text-sm">
          Client Premium
        </Badge>
      </div>
    </div>
  );
};

export default ClientDashboardHeader;
