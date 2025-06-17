
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useScrapingStatus } from '@/hooks/scraping/useScrapingStatus';
import { useHistoryCleanup } from '@/hooks/useHistoryCleanup';
import { getLogsToDelete } from './utils/cleanupUtils';
import CleanupSection from './components/CleanupSection';
import HistoryPreview from './components/HistoryPreview';
import HistoryStats from './components/HistoryStats';

const ScrapingHistoryManager = () => {
  const { logs, loading, refetch } = useScrapingStatus();
  const { isCleaningUp, performCleanup } = useHistoryCleanup();
  const [cleanupFilter, setCleanupFilter] = useState<string>('older_than_week');

  const logsToDelete = getLogsToDelete(logs, cleanupFilter);

  const handleCleanup = async () => {
    const success = await performCleanup(cleanupFilter, logsToDelete.length);
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
          <Badge variant="outline">
            {logs.length} logs total
          </Badge>
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
