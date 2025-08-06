import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
  title = "Une erreur s'est produite",
  description = "Nous nous excusons pour la gêne occasionnée. Veuillez réessayer ou contacter le support si le problème persiste.",
  showHomeButton = true,
  showRetryButton = true
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            {title}
          </AlertDescription>
        </Alert>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <p className="text-gray-600 text-sm">
            {description}
          </p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Détails techniques (développement)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 pt-2">
            {showRetryButton && resetError && (
              <Button 
                onClick={resetError}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            
            {showHomeButton && (
              <Button 
                onClick={handleGoHome}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};