import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Quote, Play } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Marc Dubois",
    business: "Répar'Smart Paris 11ème",
    rating: 5,
    text: "Depuis que j'utilise TopRéparateurs, mon chiffre d'affaires a augmenté de 40%. Le référencement local fonctionne vraiment bien et mes clients adorent pouvoir suivre leurs réparations en ligne.",
    avatar: "MD",
    specialties: ["iPhone", "Samsung", "Huawei"],
    videoUrl: "#"
  },
  {
    id: 2,
    name: "Sophie Martin",
    business: "TechRepair Lyon",
    rating: 5,
    text: "La boutique en ligne m'a permis de vendre des accessoires même quand mon magasin est fermé. Le module POS est parfait pour ma comptabilité, tout est automatisé.",
    avatar: "SM",
    specialties: ["Tablettes", "PC portables", "Accessoires"],
    videoUrl: "#"
  },
  {
    id: 3,
    name: "Ahmed Benali",
    business: "Mobile Fix Marseille",
    rating: 5,
    text: "Le support client est exceptionnel. J'ai eu un problème un dimanche soir, l'équipe a répondu en 10 minutes. Ça change tout quand on gère une entreprise.",
    avatar: "AB",
    specialties: ["Réparations express", "Données"],
    videoUrl: "#"
  },
  {
    id: 4,
    name: "Claire Rousseau",
    business: "iTech Services Bordeaux",
    rating: 5,
    text: "Grâce au module QualiRépar, je récupère facilement mes bonus. Plus besoin de paperasse, tout se fait automatiquement. Un vrai gain de temps !",
    avatar: "CR",
    specialties: ["iPhone", "iPad", "MacBook"],
    videoUrl: "#"
  },
  {
    id: 5,
    name: "Thomas Legrand",
    business: "Smartphone Clinic Lille",
    rating: 5,
    text: "J'étais sceptique au début, mais maintenant je ne peux plus m'en passer. Les clients me trouvent plus facilement et ma productivité a vraiment augmenté.",
    avatar: "TL",
    specialties: ["Android", "Samsung", "Xiaomi"],
    videoUrl: "#"
  },
  {
    id: 6,
    name: "Isabelle Fournier",
    business: "Répar'Tech Toulouse",
    rating: 5,
    text: "La formation était parfaite, j'ai pu prendre en main tous les outils rapidement. Mes clients apprécient le professionnalisme que ça apporte à mon service.",
    avatar: "IF",
    specialties: ["Tout smartphone", "Garantie"],
    videoUrl: "#"
  }
];

const stats = [
  { value: "2500+", label: "Réparateurs actifs" },
  { value: "98%", label: "Satisfaction" },
  { value: "+45%", label: "CA moyen" },
  { value: "7j/7", label: "Support" }
];

const RepairerTestimonials: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Témoignages Réparateurs - Ils ont transformé leur activité | TopRéparateurs</title>
        <meta 
          name="description" 
          content="Découvrez comment plus de 2500 réparateurs ont digitalisé leur activité avec TopRéparateurs. Témoignages vidéos et retours d'expérience." 
        />
        <meta name="keywords" content="témoignages réparateurs, avis TopRéparateurs, réussite réparateur smartphone, digitalisation atelier" />
        <link rel="canonical" href="https://topreparateurs.fr/repairer/temoignages" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to="/repairer/plans"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux plans
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Témoignages Réparateurs</h1>
                <p className="text-muted-foreground mt-2">
                  Découvrez comment nos partenaires ont transformé leur activité
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="py-12 bg-electric-blue text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-electric-blue-light">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ils nous font confiance
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Retours d'expérience de réparateurs qui ont digitalisé leur activité avec succès
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-electric-blue text-white rounded-full flex items-center justify-center font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      {testimonial.videoUrl !== "#" && (
                        <Button size="sm" variant="outline" className="p-2">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <blockquote className="relative">
                      <Quote className="absolute -top-2 -left-2 w-6 h-6 text-electric-blue opacity-50" />
                      <p className="text-muted-foreground italic pl-4 leading-relaxed">
                        "{testimonial.text}"
                      </p>
                    </blockquote>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Spécialités :</p>
                      <div className="flex flex-wrap gap-1">
                        {testimonial.specialties.map((specialty, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-electric-blue-light text-electric-blue text-xs rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video testimonials section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Témoignages vidéo
              </h2>
              <p className="text-xl text-muted-foreground">
                Écoutez directement nos partenaires parler de leur expérience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-electric-blue to-electric-blue-dark flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="font-semibold">Marc Dubois</p>
                    <p className="text-sm text-electric-blue-light">Répar'Smart Paris</p>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-vibrant-orange to-vibrant-orange-dark flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="font-semibold">Sophie Martin</p>
                    <p className="text-sm text-vibrant-orange-light">TechRepair Lyon</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Prêt à rejoindre nos partenaires ?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Commencez dès aujourd'hui votre transformation digitale avec 7 jours d'essai gratuit
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-electric-blue hover:bg-electric-blue-dark"
                  >
                    <Link to="/repairer-auth">
                      Démarrer gratuitement
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    size="lg"
                  >
                    <Link to="/repairer/plans">
                      Voir les plans
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default RepairerTestimonials;