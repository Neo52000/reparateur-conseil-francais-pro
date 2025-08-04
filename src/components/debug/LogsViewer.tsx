import React, { useState } from 'react';
import { useLogger } from '@/hooks/safe/useLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, AlertCircle, Bug } from 'lucide-react';

const LogsViewer: React.FC = () => {
  const { getLogs, getErrorLogs, clearLogs } = useLogger();
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  
  const logs = showOnlyErrors ? getErrorLogs() : getLogs();
  
  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'debug': return <Bug className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logs de l'Application</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={showOnlyErrors ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyErrors(!showOnlyErrors)}
            >
              {showOnlyErrors ? 'Tous les logs' : 'Erreurs uniquement'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Vider les logs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun log trouvé
            </p>
          ) : (
            logs.slice(-50).reverse().map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                {getIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getBadgeVariant(log.level) as any}>
                      {log.level.toUpperCase()}
                    </Badge>
                    {log.component && (
                      <Badge variant="outline">{log.component}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{log.message}</p>
                  {log.data && (
                    <pre className="text-xs text-muted-foreground mt-1 bg-background p-2 rounded overflow-x-auto">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsViewer;