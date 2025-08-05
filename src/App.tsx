import React from 'react';

// Version ultra-basique - composant React approprié
const App: React.FC = () => {
  return React.createElement('div', {}, [
    React.createElement('h1', { key: 'title' }, 'TopRéparateurs.fr'),
    React.createElement('p', { key: 'desc' }, 'Test basique - Si vous voyez ceci, React fonctionne')
  ]);
};

export default App;