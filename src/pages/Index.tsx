
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Wrench, 
  MapPin, 
  Star, 
  Clock, 
  PhoneCall,
  Search,
  Shield
} from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trouvez le bon réparateur près de chez vous
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Smartphones, tablettes, ordinateurs - Réparation rapide et de qualité
            </p>
            
            {user ? (
              <div className="space-y-4">
                <p className="text-lg">
                  Bonjour {profile?.first_name || 'utilisateur'} !
                </p>
                <div className="flex justify-center space-x-4">
                  <Link to="/quotes-appointments">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Demander un devis
                    </Button>
                  </Link>
                  {profile?.role === 'partner' && (
                    <Link to="/partner-dashboard">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        Dashboard Partenaire
                      </Button>
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link to="/admin">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Commencer
                    </Button>
                  </Link>
                  <Link to="/quotes-appointments">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      Voir les tarifs
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600">
            Trouvez et contactez les meilleurs réparateurs en quelques clics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Search className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>1. Recherchez</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Décrivez votre problème et trouvez des réparateurs près de chez vous
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <PhoneCall className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>2. Contactez</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Demandez un devis gratuit et prenez rendez-vous directement
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Wrench className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>3. Réparez</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Votre appareil est réparé rapidement par un professionnel qualifié
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 p-4 rounded-lg border">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="font-medium">Réparation écran</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="font-medium">Réparateurs certifiés</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="font-medium">Réparation rapide</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border">
              <Star className="h-8 w-8 text-blue-600" />
              <span className="font-medium">Garantie qualité</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à faire réparer votre appareil ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des milliers d'utilisateurs satisfaits
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Créer un compte gratuit
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
