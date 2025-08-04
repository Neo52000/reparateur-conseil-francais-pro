import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useSimpleAuth';
import SimpleNavigation from '@/components/SimpleNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Wrench, Shield, User, MapPin, Star, Clock } from 'lucide-react';

const CompleteIndex = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');

  const services = [
    { id: 'ecran', name: 'Réparation Écran', icon: '📱' },
    { id: 'batterie', name: 'Remplacement Batterie', icon: '🔋' },
    { id: 'camera', name: 'Réparation Caméra', icon: '📷' },
    { id: 'audio', name: 'Problème Audio', icon: '🔊' },
    { id: 'connectique', name: 'Port de Charge', icon: '🔌' },
    { id: 'vitre', name: 'Vitre Arrière', icon: '🛡️' }
  ];

  const stats = [
    { number: '15,000+', label: 'Réparations Effectuées', icon: Wrench },
    { number: '500+', label: 'Réparateurs Certifiés', icon: Shield },
    { number: '50+', label: 'Villes Couvertes', icon: MapPin },
    { number: '4.8/5', label: 'Satisfaction Client', icon: Star }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              RepairHub
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              La plateforme qui connecte les particuliers avec les meilleurs réparateurs 
              de smartphones et appareils mobiles près de chez vous.
            </p>
            
            {user ? (
              <div className="bg-card p-6 rounded-lg shadow-md border max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">
                  Bienvenue {profile?.first_name || 'Utilisateur'} !
                </h3>
                <p className="text-muted-foreground mb-4">
                  Accédez à votre espace personnel
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/client')} variant="default">
                    <User className="w-4 h-4 mr-2" />
                    Espace Client
                  </Button>
                  {profile?.role === 'repairer' && (
                    <Button onClick={() => navigate('/repairer')} variant="outline">
                      <Wrench className="w-4 h-4 mr-2" />
                      Espace Réparateur
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/client-auth')}>
                  Trouver un Réparateur
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/repairer-auth')}>
                  Devenir Réparateur
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services rapides */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Services de Réparation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sélectionnez le type de réparation dont vous avez besoin
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedService === service.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <h3 className="text-sm font-medium">{service.name}</h3>
                </div>
              </div>
            ))}
          </div>

          {selectedService && (
            <div className="mt-8 text-center">
              <Button size="lg" onClick={() => navigate('/client-auth')}>
                Trouver un Réparateur pour {services.find(s => s.id === selectedService)?.name}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi Choisir RepairHub ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-xl font-semibold">Réparateurs Certifiés</h3>
              </div>
              <p className="text-muted-foreground">
                Tous nos réparateurs sont vérifiés et certifiés pour garantir la qualité de service.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold">Service Rapide</h3>
              </div>
              <p className="text-muted-foreground">
                Trouvez un réparateur disponible près de chez vous en quelques clics.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-purple-500 mr-3" />
                <h3 className="text-xl font-semibold">Garantie Incluse</h3>
              </div>
              <p className="text-muted-foreground">
                Toutes les réparations sont couvertes par notre garantie de satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* État du système (si mode développement) */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-8 bg-yellow-50 border-t border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">🔧 État du Système</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Authentification</h4>
                  <div className="space-y-1">
                    <Badge variant={user ? "default" : "secondary"}>
                      User: {user ? "✅" : "❌"}
                    </Badge>
                    <Badge variant={profile ? "default" : "secondary"}>
                      Profile: {profile ? "✅" : "❌"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Navigation</h4>
                  <Badge variant="default">Fonctionnelle ✅</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">UI Components</h4>
                  <Progress value={100} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">Tous opérationnels</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-muted mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">RepairHub</h3>
              <p className="text-muted-foreground text-sm">
                La plateforme de référence pour la réparation mobile en France.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Réparation Smartphone</li>
                <li>Réparation Tablette</li>
                <li>Réparation Ordinateur</li>
                <li>Accessoires</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Réparateurs</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Devenir Partenaire</li>
                <li>Espace Pro</li>
                <li>Formation</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Centre d'aide</li>
                <li>Contact</li>
                <li>CGU</li>
                <li>Politique de confidentialité</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 RepairHub. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompleteIndex;