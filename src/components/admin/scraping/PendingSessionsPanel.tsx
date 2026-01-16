import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, Play, Trash2, Clock, MapPin, Database,
  RefreshCw, Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PendingScrapingSession, GooglePlaceResult } from '@/hooks/scraping/useScrapingPersistence';

interface PendingSessionsPanelProps {
  sessions: PendingScrapingSession[];
  loading: boolean;
  onResume: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onRefresh: () => void;
}

const PendingSessionsPanel: React.FC<PendingSessionsPanelProps> = ({
  sessions,
  loading,
  onResume,
  onDelete,
  onRefresh,
}) => {
  if (sessions.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Sessions en attente ({sessions.length})
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {sessions.map((session) => (
                <div 
                  key={session.session_id} 
                  className="p-3 bg-muted/50 rounded-lg border border-border/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{session.city}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.results_count} résultats
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(session.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {session.source}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="flex-1 gap-1"
                      onClick={() => onResume(session.session_id)}
                    >
                      <Play className="h-3 w-3" />
                      Reprendre
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1 text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(session.session_id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingSessionsPanel;
