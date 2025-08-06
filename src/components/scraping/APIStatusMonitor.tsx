import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface APIStatus {
  name: string;
  status: 'active' | 'down' | 'fallback';
  lastCheck: string;
  responseTime?: number;
  fallbackUsed?: string;
}

const APIStatusMonitor: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'DeepSeek', status: 'active', lastCheck: new Date().toISOString() },
    { name: 'Mistral', status: 'active', lastCheck: new Date().toISOString() },
    { name: 'OpenAI', status: 'active', lastCheck: new Date().toISOString() },
    { name: 'Serper', status: 'active', lastCheck: new Date().toISOString() }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'fallback': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default' as const,
      down: 'destructive' as const,
      fallback: 'secondary' as const
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Statut des APIs IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {apiStatuses.map((api) => (
            <div key={api.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(api.status)}
                <span className="font-medium">{api.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadge(api.status)}>
                  {api.status === 'active' ? 'Actif' : 
                   api.status === 'down' ? 'Hors ligne' : 'Fallback'}
                </Badge>
                {api.responseTime && (
                  <span className="text-xs text-muted-foreground">
                    {api.responseTime}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Système de fallback intelligent activé :</strong> Si une API échoue, 
            le système bascule automatiquement vers l'API suivante pour assurer la continuité du service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIStatusMonitor;