
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { socialBoosterService } from '@/services/social/socialBoosterService';
import { Loader2, ScrollText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { SocialPublicationLog } from '@/types/socialBooster';

const SocialBoosterLogs: React.FC = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['social-booster-logs'],
    queryFn: () => socialBoosterService.getLogs(100),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Journal des publications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Aucun log disponible</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log: SocialPublicationLog) => (
              <div key={log.id} className="flex items-center gap-3 p-3 border rounded-md text-sm">
                <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'outline'} className="text-xs">
                  {log.status}
                </Badge>
                <span className="font-medium">{log.action}</span>
                {log.error_message && (
                  <span className="text-destructive text-xs truncate max-w-[300px]">{log.error_message}</span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(log.created_at), 'dd MMM HH:mm', { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialBoosterLogs;
