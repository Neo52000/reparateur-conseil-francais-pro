import React from 'react';

// Version simplifiée pour diagnostiquer le problème React
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-primary">
          TopRéparateurs.fr
        </h1>
        <p className="text-center text-muted-foreground mt-4">
          Application en cours de chargement...
        </p>
      </div>
    </div>
  );
};

export default App;