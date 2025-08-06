
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';
import { CLEANUP_OPTIONS } from '../constants/cleanupOptions';

interface CleanupSectionProps {
  cleanupFilter: string;
  setCleanupFilter: (value: string) => void;
  isCleaningUp: boolean;
  logsToDelete: ScrapingLog[];
  onCleanup: () => void;
}

const CleanupSection: React.FC<CleanupSectionProps> = ({
  cleanupFilter,
  setCleanupFilter,
  isCleaningUp,
  logsToDelete,
  onCleanup
}) => {
  const selectedOption = CLEANUP_OPTIONS.find(opt => opt.value === cleanupFilter);

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center">
        <Trash2 className="h-4 w-4 mr-2 text-red-600" />
        Nettoyage de l'historique
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Critère de suppression</Label>
          <Select value={cleanupFilter} onValueChange={setCleanupFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLEANUP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedOption && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedOption.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col justify-end">
          <Button
            onClick={onCleanup}
            disabled={isCleaningUp || logsToDelete.length === 0}
            variant="destructive"
            className="w-full"
          >
            {isCleaningUp ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Nettoyage...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({logsToDelete.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {logsToDelete.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{logsToDelete.length} log(s)</strong> seront supprimés avec ce critère.
            {cleanupFilter === 'all' && (
              <span className="text-red-600 font-medium"> Cette action supprimera TOUT l'historique !</span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CleanupSection;
