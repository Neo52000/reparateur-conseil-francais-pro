import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Tablet, 
  Laptop, 
  Gamepad2, 
  CheckCircle, 
  Clock, 
  Shield, 
  Award,
  Star,
  MapPin
} from 'lucide-react';

const serviceConfig = {
  smartphone: {
    title: 'Réparation Smartphone',
    icon: Smartphone,
    description: 'Réparation rapide et professionnelle de tous types de smartphones',
    problems: [
      'Écran cassé ou fissuré',
      'Batterie défaillante', 
      'Problème de charge',
      'Caméra défectueuse',
      'Haut-parleur/micro',
      'Boutons endommagés'
    ],
    brands: ['iPhone', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google Pixel'],
    avgPrice: '89€',
    avgTime: '30-60 min'
  },
  tablette: {
    title: 'Réparation Tablette',
    icon: Tablet,
    description: 'Service de réparation spécialisé pour iPad et tablettes Android',
    problems: [
      'Écran tactile défaillant',
      'Problème de connectique',
      'Batterie qui ne tient plus',
      'Caméra ou micro HS',
      'Bouton home cassé',
      'Problème wifi/bluetooth'
    ],
    brands: ['iPad', 'Samsung Galaxy Tab', 'Huawei MediaPad', 'Lenovo Tab', 'Surface'],
    avgPrice: '129€',
    avgTime: '45-90 min'
  },
  ordinateur: {
    title: 'Réparation Ordinateur',
    icon: Laptop,
    description: 'Dépannage informatique pour PC portables et fixes',
    problems: [
      'Écran noir au démarrage',
      'Surchauffe excessive',
      'Clavier défaillant',
      'Problème de disque dur',
      'Virus et malwares',
      'Problème de connectique'
    ],
    brands: ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'MacBook'],
    avgPrice: '159€',
    avgTime: '1-3 heures'
  },
  console: {
    title: 'Réparation Console',
    icon: Gamepad2,
    description: 'Réparation de consoles de jeux PlayStation, Xbox, Nintendo',
    problems: [
      'Console qui ne s\'allume plus',
      'Problème de lecture disque',
      'Surchauffe',
      'Manettes défectueuses',
      'Connectiques HDMI/USB',
      'Problème de ventilation'
    ],
    brands: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Steam Deck'],
    avgPrice: '99€',
    avgTime: '1-2 heures'
  }
};

export default function ServiceRepairPage() {
  const { serviceType } = useParams<{ serviceType: string }>();
  const config = serviceConfig[serviceType as keyof typeof serviceConfig];

  if (!config) {
    return <div>Service non trouvé</div>;
  }

  const Icon = config.icon;

  return (
    <>
      <Helmet>
        <title>{config.title} - Réparateurs Professionnels | TopRéparateurs.fr</title>
        <meta 
          name="description" 
          content={`${config.description}. Trouvez un réparateur qualifié près de chez vous. Devis gratuit, intervention rapide. Prix moyen: ${config.avgPrice}`}
        />
        <meta name="keywords" content={`réparation ${serviceType}, ${config.brands.join(', ')}, réparateur professionnel`} />
        <link rel="canonical" href={`https://topreparateurs.fr/reparation-${serviceType}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Icon className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                {config.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {config.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Intervention: {config.avgTime}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Award className="h-4 w-4 mr-2" />
                  Prix moyen: {config.avgPrice}
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Garantie incluse
                </Badge>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Trouver un réparateur
              </Button>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Problèmes fréquents que nous résolvons
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.problems.map((problem, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{problem}</h3>
                      <p className="text-sm text-muted-foreground">
                        Diagnostic gratuit et devis transparent avant intervention
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Marques prises en charge</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {config.brands.map((brand, index) => (
                <Badge key={index} variant="outline" className="px-6 py-3 text-lg">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Pourquoi choisir nos réparateurs ?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Réparateurs certifiés</h3>
                <p className="text-sm text-muted-foreground">
                  Professionnels qualifiés et expérimentés
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Garantie incluse</h3>
                <p className="text-sm text-muted-foreground">
                  Toutes nos réparations sont garanties
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Intervention rapide</h3>
                <p className="text-sm text-muted-foreground">
                  Réparation souvent réalisée en moins d'une heure
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Proche de chez vous</h3>
                <p className="text-sm text-muted-foreground">
                  Réseau national de réparateurs de proximité
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Trouvez votre réparateur en 2 minutes
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comparez les prix, consultez les avis et prenez rendez-vous directement en ligne
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Rechercher un réparateur
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}