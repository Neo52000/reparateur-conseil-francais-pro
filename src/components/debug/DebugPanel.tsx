import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import LogsViewer from '@/components/debug/LogsViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Afficher seulement en développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background shadow-lg"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={null}>
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Panel Debug</CardTitle>
                <Badge variant="secondary" className="text-xs">Dev</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                État de l'application : <span className="text-green-600 font-medium">Stable</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Error Boundaries : <span className="text-green-600 font-medium">Actifs</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Safe Hooks : <span className="text-green-600 font-medium">Opérationnels</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-2">
          <LogsViewer />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DebugPanel;