
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Filter, Zap } from 'lucide-react';

interface RepairersTableHeaderProps {
  onAddRepairer: () => void;
  onRefresh?: () => void;
  onSeoOptimize?: () => void;
}

const RepairersTableHeader: React.FC<RepairersTableHeaderProps> = ({ onAddRepairer, onRefresh, onSeoOptimize }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Gestion des réparateurs</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les réparateurs inscrits sur la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onSeoOptimize && (
            <Button onClick={onSeoOptimize} variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100">
              <Zap className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-blue-700">SEO Local</span>
            </Button>
          )}
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
          <Button onClick={onAddRepairer} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default RepairersTableHeader;
