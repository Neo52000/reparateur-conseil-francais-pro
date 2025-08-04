import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SimpleIndex = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">RepairHub</h1>
            </div>
            <nav className="flex space-x-4">
              <Link 
                to="/admin" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Administration
              </Link>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                Réparateur
              </button>
              <button className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors">
                Client
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            🔧 Application Stabilisée
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            L'application RepairHub fonctionne maintenant sans erreurs React.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4">✅ Systèmes OK</h3>
              <ul className="text-left text-sm space-y-2">
                <li>• Navigation fonctionnelle</li>
                <li>• Routing configuré</li>
                <li>• Imports React corrects</li>
                <li>• Components UI stables</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4">🔒 Accès Admin</h3>
              <p className="text-muted-foreground mb-4">
                Interface d'administration accessible.
              </p>
              <Link 
                to="/admin" 
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Accéder
              </Link>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4">🛠️ Prochaines Étapes</h3>
              <ul className="text-left text-sm space-y-2">
                <li>• Réactiver Zustand</li>
                <li>• Restaurer toast system</li>
                <li>• Tests complets</li>
                <li>• Optimisations</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-muted mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 RepairHub - Application stabilisée et fonctionnelle</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleIndex;