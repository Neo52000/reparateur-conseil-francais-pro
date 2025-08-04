import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Toaster } from 'sonner';

interface SafeAppProviderProps {
  children: ReactNode;
}

const SafeAppProvider: React.FC<SafeAppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RepairHub</h1>
          <p className="text-gray-600">Initialisation de l'application...</p>
        </div>
      </div>
    }>
      {children}
      <ErrorBoundary fallback={null}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#374151',
              border: '1px solid #e5e7eb'
            }
          }}
        />
      </ErrorBoundary>
    </ErrorBoundary>
  );
};

export default SafeAppProvider;