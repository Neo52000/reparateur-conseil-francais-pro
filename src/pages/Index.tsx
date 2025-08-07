// Version simplifiée temporaire pour débugger la page blanche
import React from 'react';

const Index = () => {
  console.log('🏠 Index page: SIMPLIFIED VERSION RENDERING...');
  
  return (
    <div style={{ padding: '20px', color: 'black', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1>Test Page - DEBUG MODE</h1>
      <p>Si vous voyez ce message, l'app fonctionne de base.</p>
      <p>Page blanche résolue - les providers React fonctionnent.</p>
    </div>
  );
};

export default Index;