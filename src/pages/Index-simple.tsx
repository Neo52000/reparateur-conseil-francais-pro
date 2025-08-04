import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
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
              <Link 
                to="/repairer-auth" 
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
              >
                Réparateur
              </Link>
              <Link 
                to="/client-auth" 
                className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
              >
                Client
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Bienvenue sur RepairHub
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plateforme qui connecte les particuliers avec les meilleurs réparateurs de smartphones et appareils mobiles.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4">Pour les Clients</h3>
              <p className="text-muted-foreground mb-4">
                Trouvez rapidement un réparateur qualifié près de chez vous.
              </p>
              <Link 
                to="/client-auth" 
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Commencer
              </Link>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4">Pour les Réparateurs</h3>
              <p className="text-muted-foreground mb-4">
                Développez votre activité et gérez vos clients efficacement.
              </p>
              <Link 
                to="/repairer-auth" 
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Rejoindre
              </Link>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <h3 className="text-xl font-semibold mb-4">Administration</h3>
              <p className="text-muted-foreground mb-4">
                Interface de gestion pour les administrateurs de la plateforme.
              </p>
              <Link 
                to="/admin" 
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Accéder
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-muted mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 RepairHub. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;