
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Zap } from 'lucide-react';

interface RepairersTableHeaderProps {
  onAddRepairer: () => void;
  onRefresh?: () => void;
  onSeoOptimize?: () => void;
  totalCount?: number;
  filteredCount?: number;
}

const RepairersTableHeader: React.FC<RepairersTableHeaderProps> = ({ 
  onAddRepairer, 
  onRefresh, 
  onSeoOptimize,
  totalCount,
  filteredCount
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Gestion des réparateurs
            {totalCount !== undefined && (
              <Badge variant="outline" className="ml-2">
                {filteredCount !== undefined && filteredCount !== totalCount 
                  ? `${filteredCount} / ${totalCount}`
                  : totalCount
                }
              </Badge>
            )}
          </CardTitle>
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
