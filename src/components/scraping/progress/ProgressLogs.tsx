import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database } from 'lucide-react';

interface ProgressLogsProps {
  logs: string[];
}

const ProgressLogs: React.FC<ProgressLogsProps> = ({ logs }) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Database className="h-5 w-5 mr-2 text-admin-purple" />
        <h3 className="font-semibold">Logs du Processus</h3>
      </div>
      <ScrollArea className="h-48 w-full">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="text-xs font-mono p-2 bg-muted/50 rounded">
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-xs text-muted-foreground p-2">
              Aucun log disponible
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProgressLogs;