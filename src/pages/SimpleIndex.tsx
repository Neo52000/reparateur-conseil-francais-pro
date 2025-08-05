// Page d'accueil statique simple sans React hooks
export default function SimpleIndex() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation simple */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">RepairHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/client-auth" className="px-4 py-2 text-muted-foreground hover:text-primary">
                Connexion
              </a>
              <a href="/repairer-auth" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                S'inscrire
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trouvez votre réparateur de confiance
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Service rapide, transparent et de qualité près de chez vous
            </p>
            
            {/* Formulaire de recherche simple */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 flex gap-2">
                <div className="flex-1">
                  <input 
                    placeholder="Que voulez-vous réparer ?" 
                    className="w-full px-3 py-2 border-0 text-foreground bg-background rounded"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    placeholder="Votre ville" 
                    className="w-full px-3 py-2 border-0 text-foreground bg-background rounded"
                  />
                </div>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Clients satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-muted-foreground">Réparations effectuées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Villes couvertes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pourquoi choisir RepairHub ?</h2>
            <p className="text-xl text-muted-foreground">
              La plateforme de confiance pour tous vos besoins de réparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 text-primary mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3">Réparateurs vérifiés</h3>
              <p className="text-muted-foreground">
                Tous nos réparateurs sont vérifiés et certifiés pour vous garantir un service de qualité.
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 text-primary mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-3">Service rapide</h3>
              <p className="text-muted-foreground">
                Trouvez un réparateur disponible rapidement et obtenez un devis en quelques clics.
              </p>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 text-primary mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-3">Qualité garantie</h3>
              <p className="text-muted-foreground">
                Avis clients vérifiés et garantie sur les réparations pour votre tranquillité d'esprit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à réparer ?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Trouvez le bon réparateur en quelques minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/client-auth" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Trouver un réparateur
            </a>
            <a href="/admin" className="inline-block px-6 py-3 border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground">
              Administration
            </a>
          </div>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 RepairHub. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}