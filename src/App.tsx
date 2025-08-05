import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { StaticAuthProvider as AuthProvider } from '@/hooks/useStaticAuth';

// Only static page without hooks
import HomePage from '@/pages/SimpleIndex';

// Global styles
import './index.css';

// Completely static App without Router or any hooks to avoid React corruption
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <HomePage />
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;