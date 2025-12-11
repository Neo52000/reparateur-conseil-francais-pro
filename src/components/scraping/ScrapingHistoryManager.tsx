import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';
import { useScrapingStatus } from '@/hooks/scraping/useScrapingStatus';
import { useHistoryCleanup } from '@/hooks/useHistoryCleanup';
import { getLogsToDelete } from './utils/cleanupUtils';
import CleanupSection from './components/CleanupSection';
import HistoryPreview from './components/HistoryPreview';
import HistoryStats from './components/HistoryStats';

const ScrapingHistoryManager = () => {
  const { logs, loading, refetch } = useScrapingStatus();
  const { isCleaningUp, performCleanup, deleteAllHistory } = useHistoryCleanup();
  const [cleanupFilter, setCleanupFilter] = useState<string>('older_than_week');

  const logsToDelete = getLogsToDelete(logs, cleanupFilter);

  const handleCleanup = async () => {
    const success = await performCleanup(cleanupFilter, logsToDelete.length);
    if (success) {
      await refetch();
    }
  };

  const handleDeleteAll = async () => {
    if (logs.length === 0) return;
    const success = await deleteAllHistory();
    if (success) {
      await refetch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Gestion de l'Historique
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {logs.length} logs total
            </Badge>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteAll}
              disabled={isCleaningUp || logs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Tout supprimer
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CleanupSection
          cleanupFilter={cleanupFilter}
          setCleanupFilter={setCleanupFilter}
          isCleaningUp={isCleaningUp}
          logsToDelete={logsToDelete}
          onCleanup={handleCleanup}
        />

        <HistoryPreview
          logs={logs}
          loading={loading}
          onRefetch={refetch}
        />

        <HistoryStats logs={logs} />
      </CardContent>
    </Card>
  );
};

export default ScrapingHistoryManager;
