import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Store, 
  ShoppingCart, 
  CreditCard, 
  Zap,
  Package,
  MessageSquare,
  Shield,
  Recycle,
  Camera,
  Brain,
  Globe,
  Users,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  category: 'core' | 'advanced' | 'ai' | 'marketing';
  pricing: {
    monthly: number;
    yearly: number;
    setup?: number;
  };
  features: string[];
  benefits: string[];
  requirements?: string[];
  tags: string[];
  popularity: number;
  isNew?: boolean;
  isRecommended?: boolean;
}

const ModulesStore = () => {
  const { modules, loading, hasModuleAccess, activateModule, deactivateModule, loadModules } = useModuleAccess();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, [user]);

  const moduleDefinitions: ModuleDefinition[] = [
    {
      id: 'pos',
      name: 'POS Avancé',
      description: 'Système de caisse complet avec gestion stock et analytics',
      longDescription: 'Système de point de vente professionnel avec gestion d\'inventaire en temps réel, facturation automatique, et analytics de performance.',
      icon: <ShoppingCart className="h-6 w-6" />,
      category: 'core',
      pricing: { monthly: 49.90, yearly: 499.00 },
      features: [
        'Caisse tactile intuitive',
        'Gestion stock temps réel',
        'Facturation automatique NF525',
        'Analytics de vente',
        'Gestion multi-staff',
        'Synchronisation cloud'
      ],
      benefits: [
        'Gagnez 3h/jour sur la gestion',
        'Réduisez les erreurs de caisse de 95%',
        'Augmentez votre CA de 20% en moyenne'
      ],
      tags: ['Essentiel', 'Productivité'],
      popularity: 95,
      isRecommended: true
    },
    {
      id: 'ecommerce',
      name: 'Boutique E-commerce',
      description: 'Boutique en ligne avec click & collect et livraison locale',
      longDescription: 'Créez votre boutique en ligne complète avec gestion automatique des commandes, click & collect, et livraison locale.',
      icon: <Store className="h-6 w-6" />,
      category: 'core',
      pricing: { monthly: 89.00, yearly: 890.00 },
      features: [
        'Boutique responsive',
        'Click & Collect',
        'Livraison locale',
        'Paiement sécurisé',
        'Gestion commandes',
        'Catalogue synchronisé'
      ],
      benefits: [
        'Doublez votre zone de chalandise',
        'Vendez 24h/24 sans effort',
        'Fidélisez vos clients existants'
      ],
      tags: ['Croissance', 'Digital'],
      popularity: 87
    },
    {
      id: 'certificates',
      name: 'Certificats d\'Irréparabilité',
      description: 'Génération automatique des certificats conformes',
      longDescription: 'Module de génération automatique des certificats d\'irréparabilité conformes à la réglementation française, avec archivage sécurisé.',
      icon: <Shield className="h-6 w-6" />,
      category: 'advanced',
      pricing: { monthly: 19.90, yearly: 199.00 },
      features: [
        'Génération automatique',
        'Conformité réglementaire',
        'Archivage sécurisé NF525',
        'Signature électronique',
        'Export PDF/email',
        'Historique complet'
      ],
      benefits: [
        'Conformité garantie 100%',
        'Économisez 1h par certificat',
        'Protection juridique renforcée'
      ],
      tags: ['Conformité', 'Juridique'],
      popularity: 73
    },
    {
      id: 'buyback',
      name: 'Rachat & Reconditionnement',
      description: 'Système IA d\'évaluation et rachat de smartphones',
      longDescription: 'Module intelligent pour évaluer, racheter et reconditionner les smartphones avec estimation IA basée sur l\'état et le marché.',
      icon: <Recycle className="h-6 w-6" />,
      category: 'ai',
      pricing: { monthly: 39.90, yearly: 399.00 },
      features: [
        'Évaluation IA instantanée',
        'Grille de prix dynamique',
        'Diagnostic photo',
        'Gestion stock reconditionné',
        'Certificats de remise à neuf',
        'Suivi traçabilité'
      ],
      benefits: [
        'Nouvelle source de revenus',
        'Valorisez les retours clients',
        'Démarche éco-responsable'
      ],
      tags: ['IA', 'Écologie', 'Revenus'],
      popularity: 82,
      isNew: true
    },
    {
      id: 'advertising',
      name: 'Publicité IA Locale',
      description: 'Campagnes automatisées géolocalisées avec IA créative',
      longDescription: 'Créez et gérez automatiquement vos campagnes publicitaires locales avec génération de visuels par IA et ciblage géographique optimisé.',
      icon: <Brain className="h-6 w-6" />,
      category: 'marketing',
      pricing: { monthly: 59.90, yearly: 599.00 },
      features: [
        'Génération visuels IA',
        'Ciblage géolocalisé',
        'Landing pages automatiques',
        'A/B testing intégré',
        'ROI tracking temps réel',
        'Multi-plateformes'
      ],
      benefits: [
        'Multipliez par 3 votre visibilité',
        'Automatisation complète',
        'ROI moyen +150%'
      ],
      tags: ['IA', 'Marketing', 'Automatisation'],
      popularity: 91,
      isNew: true
    },
    {
      id: 'chatbot',
      name: 'Chatbot IA Client',
      description: 'Assistant virtuel intelligent pour votre site web',
      longDescription: 'Chatbot intelligent qui répond aux questions clients 24h/24, prend des rendez-vous et qualifie les demandes de réparation.',
      icon: <MessageSquare className="h-6 w-6" />,
      category: 'ai',
      pricing: { monthly: 29.90, yearly: 299.00 },
      features: [
        'IA conversationnelle avancée',
        'Prise de RDV automatique',
        'Qualification des pannes',
        'Multi-langues',
        'Intégration WhatsApp/SMS',
        'Analytics conversations'
      ],
      benefits: [
        'Disponible 24h/24',
        'Réduisez les appels de 60%',
        'Améliorez la satisfaction client'
      ],
      tags: ['IA', 'Service Client', 'Automatisation'],
      popularity: 78
    },
    {
      id: 'social_reviews',
      name: 'Gestion Avis & Réputation',
      description: 'Monitoring et gestion automatisée de votre e-réputation',
      longDescription: 'Surveillez et gérez votre réputation en ligne avec réponses automatiques aux avis, demandes de feedback et tableau de bord réputation.',
      icon: <Star className="h-6 w-6" />,
      category: 'marketing',
      pricing: { monthly: 24.90, yearly: 249.00 },
      features: [
        'Monitoring multi-plateformes',
        'Réponses automatiques IA',
        'Campagnes de feedback',
        'Tableau de bord réputation',
        'Alertes temps réel',
        'Rapports détaillés'
      ],
      benefits: [
        'Note moyenne +0.8 étoiles',
        'Automatisation à 80%',
        'Plus de visibilité locale'
      ],
      tags: ['Réputation', 'Automatisation'],
      popularity: 69
    },
    {
      id: 'team_management',
      name: 'Gestion d\'Équipe',
      description: 'Outils de gestion RH et planning équipe',
      longDescription: 'Gérez votre équipe avec planning intelligent, gestion des permissions, suivi des performances et paie simplifiée.',
      icon: <Users className="h-6 w-6" />,
      category: 'advanced',
      pricing: { monthly: 19.90, yearly: 199.00, setup: 99.00 },
      features: [
        'Planning intelligent',
        'Gestion permissions',
        'Suivi performances',
        'Paie simplifiée',
        'Formations intégrées',
        'Communications équipe'
      ],
      benefits: [
        'Optimisez la productivité',
        'Réduisez les conflits planning',
        'Automatisez la paie'
      ],
      requirements: ['Minimum 2 employés'],
      tags: ['RH', 'Management'],
      popularity: 56
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous les modules', count: moduleDefinitions.length },
    { id: 'core', name: 'Modules Essentiels', count: moduleDefinitions.filter(m => m.category === 'core').length },
    { id: 'ai', name: 'Intelligence Artificielle', count: moduleDefinitions.filter(m => m.category === 'ai').length },
    { id: 'marketing', name: 'Marketing Digital', count: moduleDefinitions.filter(m => m.category === 'marketing').length },
    { id: 'advanced', name: 'Fonctions Avancées', count: moduleDefinitions.filter(m => m.category === 'advanced').length }
  ];

  const filteredModules = selectedCategory === 'all' 
    ? moduleDefinitions 
    : moduleDefinitions.filter(m => m.category === selectedCategory);

  const sortedModules = filteredModules.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return b.popularity - a.popularity;
  });

  const getModuleStatus = (moduleId: string) => {
    if (moduleId === 'pos' || moduleId === 'ecommerce') {
      return hasModuleAccess(moduleId as 'pos' | 'ecommerce') ? 'active' : 'inactive';
    }
    // Pour les autres modules, statut simulé
    return Math.random() > 0.7 ? 'active' : 'inactive';
  };

  const handleToggleModule = async (moduleId: string, currentStatus: string) => {
    if (moduleId !== 'pos' && moduleId !== 'ecommerce') {
      toast({
        title: "Bientôt disponible",
        description: "Ce module sera disponible dans une prochaine mise à jour",
        variant: "default"
      });
      return;
    }

    setActivating(moduleId);
    
    try {
      if (currentStatus === 'active') {
        await deactivateModule(moduleId as 'pos' | 'ecommerce');
        toast({
          title: "Module désactivé",
          description: `Le module ${moduleDefinitions.find(m => m.id === moduleId)?.name} a été désactivé`,
        });
      } else {
        await activateModule(moduleId as 'pos' | 'ecommerce', 'monthly');
        toast({
          title: "Module activé",
          description: `Le module ${moduleDefinitions.find(m => m.id === moduleId)?.name} a été activé`,
        });
      }
      loadModules();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du module",
        variant: "destructive"
      });
    } finally {
      setActivating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="outline">Inactif</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            Store de Modules
          </h1>
          <p className="text-gray-600 mt-2">
            Personnalisez votre expérience avec nos modules complémentaires
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Modules actifs</p>
          <p className="text-2xl font-bold text-primary">
            {modules.filter(m => m.module_active).length}
          </p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.name}
              <Badge variant="secondary" className="ml-2">{category.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Modules recommandés */}
          {selectedCategory === 'all' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Modules Recommandés pour Vous
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedModules.filter(m => m.isRecommended).map(module => {
                  const status = getModuleStatus(module.id);
                  return (
                    <Card key={module.id} className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {module.icon}
                            <h4 className="font-medium">{module.name}</h4>
                          </div>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            {module.pricing.monthly}€/mois
                          </span>
                          <Switch
                            checked={status === 'active'}
                            onCheckedChange={() => handleToggleModule(module.id, status)}
                            disabled={activating === module.id}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grille des modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedModules.map(module => {
              const status = getModuleStatus(module.id);
              
              return (
                <Card key={module.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  {module.isNew && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-orange-500">Nouveau</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-50">
                          {module.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(status)}
                            <div className="flex items-center gap-1">
                              {module.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{module.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Fonctionnalités clés :</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {module.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                        {module.features.length > 3 && (
                          <li className="text-primary text-xs">+{module.features.length - 3} autres...</li>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Bénéfices :</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {module.benefits.slice(0, 2).map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-blue-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {module.requirements && (
                      <div className="bg-amber-50 p-2 rounded border border-amber-200">
                        <p className="text-xs text-amber-800">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Prérequis : {module.requirements.join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold">
                            {module.pricing.monthly}€
                            <span className="text-sm font-normal text-gray-500">/mois</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            ou {module.pricing.yearly}€/an (2 mois offerts)
                          </p>
                          {module.pricing.setup && (
                            <p className="text-xs text-orange-600">
                              + {module.pricing.setup}€ de configuration
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={status === 'active'}
                          onCheckedChange={() => handleToggleModule(module.id, status)}
                          disabled={activating === module.id}
                        />
                      </div>
                      
                      {status !== 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleToggleModule(module.id, status)}
                          disabled={activating === module.id}
                        >
                          {activating === module.id ? (
                            <>Activation en cours...</>
                          ) : (
                            <>Activer maintenant <ArrowRight className="h-3 w-3 ml-1" /></>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModulesStore;