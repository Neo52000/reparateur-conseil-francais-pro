
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wrench, Smartphone, Euro, Brain, Archive, Zap, Shield, TrendingUp, Users, Clock, Star, Megaphone, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { useOptionalModules } from "@/hooks/useOptionalModules";

const RepairerPlans = () => {
  const { modules, loading } = useOptionalModules();

  // Convertir les modules configurés en format d'affichage
  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "w-6 h-6" };
    switch (iconName) {
      case 'Smartphone': return <Smartphone {...iconProps} />;
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />;
      case 'Euro': return <Euro {...iconProps} />;
      case 'Brain': return <Brain {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Megaphone': return <Megaphone {...iconProps} />;
      default: return <Smartphone {...iconProps} />;
    }
  };

  const getPlanDisplayName = (planKey: string) => {
    switch (planKey) {
      case 'basic': return 'Basic';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      default: return planKey.charAt(0).toUpperCase() + planKey.slice(1);
    }
  };

  const formatPrice = (module: any) => {
    if (module.pricing.monthly === 0) return "Inclus";
    return `${module.pricing.monthly}€/mois`;
  };

  // Filtrer uniquement les modules actifs
  const activeModules = modules.filter(module => module.isActive);

  const stats = {
    totalModules: modules.length,
    newThisMonth: activeModules.length,
    activeUsers: "2500+",
    satisfaction: "98%"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/repairer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Plans & Modules Réparateurs</h1>
              <p className="text-gray-600 mt-2">Découvrez nos derniers modules et choisissez le plan adapté à votre activité</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalModules}</div>
                <div className="text-sm text-gray-500">Modules disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                <div className="text-sm text-gray-500">Réparateurs actifs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques mobiles */}
        <div className="md:hidden grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalModules}</div>
              <div className="text-sm text-gray-500">Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <div className="text-sm text-gray-500">Utilisateurs</div>
            </CardContent>
          </Card>
        </div>

        {/* Derniers modules ajoutés */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Derniers Modules Ajoutés
              </h2>
              <p className="text-gray-600 mt-1">Nouvelles fonctionnalités pour booster votre activité</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {stats.newThisMonth} modules actifs
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Chargement des modules...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeModules.map((module, index) => (
                <Card key={module.id} className="hover:shadow-lg transition-all duration-300 border-l-4" 
                      style={{ borderLeftColor: 
                        module.color === 'blue' ? '#3B82F6' :
                        module.color === 'green' ? '#10B981' :
                        module.color === 'purple' ? '#8B5CF6' :
                        module.color === 'orange' ? '#F59E0B' :
                        module.color === 'red' ? '#EF4444' : '#6B7280'
                      }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          module.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          module.color === 'green' ? 'bg-green-100 text-green-600' :
                          module.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          module.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                          module.color === 'red' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getIconComponent(module.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{formatPrice(module)}</Badge>
                            {module.isActive && (
                              <Badge className="bg-green-500 text-white text-xs">DISPONIBLE</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{module.description}</p>
                  </CardHeader>
                  <CardContent>
                    {/* Nouvelles fonctionnalités */}
                    {module.newFeatures && module.newFeatures.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">🎉 Nouveautés :</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.newFeatures.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fonctionnalités principales */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Fonctionnalités :</h4>
                      <ul className="space-y-1">
                        {module.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                        {module.features.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{module.features.length - 3} autres fonctionnalités
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Plans compatibles */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Disponible avec :</h4>
                      <div className="flex flex-wrap gap-1">
                        {module.availableForPlans.map((plan, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {getPlanDisplayName(plan)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Section avantages */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Pourquoi choisir nos modules ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-200 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Conformité garantie</h3>
                  <p className="text-blue-100 text-sm">Respect de toutes les réglementations françaises (NF-525, RGPD...)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-blue-200 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Support dédié</h3>
                  <p className="text-blue-100 text-sm">Équipe technique disponible 7j/7 pour vous accompagner</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-blue-200 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{stats.satisfaction} de satisfaction</h3>
                  <p className="text-blue-100 text-sm">Plus de 2500 réparateurs nous font confiance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans d'abonnement */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre plan</h2>
            <p className="text-gray-600">Tous les plans incluent les modules de base. Modules avancés selon le plan choisi.</p>
          </div>
          <SubscriptionPlans />
        </section>

        {/* Call to action */}
        <section className="mt-12 text-center">
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Besoin d'un module personnalisé ?</h3>
              <p className="text-gray-600 mb-4">
                Notre équipe peut développer des modules sur mesure pour répondre à vos besoins spécifiques.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Contactez notre équipe
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default RepairerPlans;
