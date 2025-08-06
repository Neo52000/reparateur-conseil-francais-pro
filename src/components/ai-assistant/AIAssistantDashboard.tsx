import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, MessageSquare, Zap, TrendingUp, Calculator, 
  Users, Package, Clock, Target, Sparkles, Bot,
  BarChart3, DollarSign, PhoneCall, CheckCircle
} from 'lucide-react';
import JarvisAssistant from '@/components/ai-assistant/JarvisAssistant';
import { motion } from 'framer-motion';

interface AIAssistantDashboardProps {
  repairerId: string;
}

const AIAssistantDashboard: React.FC<AIAssistantDashboardProps> = ({ repairerId }) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analytics Intelligentes',
      description: 'Analyses en temps réel de votre performance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: '+25% insights',
      capabilities: [
        'Tableau de bord en temps réel',
        'Prédictions de revenus',
        'Analyse de la concurrence',
        'Recommandations personnalisées'
      ]
    },
    {
      id: 'pricing',
      icon: Calculator,
      title: 'Optimisation Tarifaire',
      description: 'Prix intelligents basés sur le marché',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: '+15% marge',
      capabilities: [
        'Calcul automatique des prix',
        'Analyse concurrentielle',
        'Suggestions de marge optimale',
        'Tarifs dynamiques par urgence'
      ]
    },
    {
      id: 'customer',
      icon: Users,
      title: 'Relation Client IA',
      description: 'Gestion intelligente de la clientèle',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: '+30% satisfaction',
      capabilities: [
        'Suivi automatique des clients',
        'Rappels intelligents',
        'Analyse de satisfaction',
        'Recommandations cross-sell'
      ]
    },
    {
      id: 'inventory',
      icon: Package,
      title: 'Stock Intelligent',
      description: 'Gestion prédictive des stocks',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stats: '-20% ruptures',
      capabilities: [
        'Prédiction des besoins',
        'Alertes de stock bas',
        'Commandes automatiques',
        'Optimisation des coûts'
      ]
    },
    {
      id: 'automation',
      icon: Zap,
      title: 'Automatisation',
      description: 'Tâches automatisées intelligentes',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      stats: '+3h/jour',
      capabilities: [
        'Devis automatiques',
        'Relances programmées',
        'Rapports auto-générés',
        'Workflows intelligents'
      ]
    },
    {
      id: 'insights',
      icon: Target,
      title: 'Business Intelligence',
      description: 'Conseils stratégiques personnalisés',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      stats: '+40% croissance',
      capabilities: [
        'Stratégies de croissance',
        'Détection d\'opportunités',
        'Benchmarking sectoriel',
        'Plans d\'action personnalisés'
      ]
    }
  ];

  const quickActions = [
    { icon: DollarSign, label: 'Calculer prix', action: '/price iPhone 14 écran' },
    { icon: TrendingUp, label: 'Voir analytics', action: '/analytics revenus mois' },
    { icon: PhoneCall, label: 'Rappels clients', action: '/tasks clients rappeler' },
    { icon: CheckCircle, label: 'Tâches du jour', action: '/tasks aujourd\'hui' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Jarvis - Assistant IA Réparateur
            <Badge variant="outline" className="ml-2">Phase 4</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Votre assistant IA personnel pour optimiser votre activité de réparation avec l'intelligence artificielle.
          </p>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Assistant Chat
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Fonctionnalités IA
              </TabsTrigger>
              <TabsTrigger value="quickstart" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Actions Rapides
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <JarvisAssistant repairerId={repairerId} />
            </TabsContent>

            <TabsContent value="features" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <motion.div
                    key={feature.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedFeature === feature.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                      }`}
                      onClick={() => setSelectedFeature(
                        selectedFeature === feature.id ? null : feature.id
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                          <feature.icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                        <Badge variant="secondary" className="w-fit">
                          {feature.stats}
                        </Badge>
                      </CardHeader>
                      
                      {selectedFeature === feature.id && (
                        <CardContent>
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Capacités :</h4>
                            <ul className="space-y-1">
                              {feature.capabilities.map((capability, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {capability}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900">IA Contextuelle</h3>
                      <p className="text-blue-700 text-sm">
                        Jarvis apprend de vos habitudes et s'adapte à votre façon de travailler pour des conseils toujours plus pertinents.
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Auto-apprentissage
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quickstart" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Actions Rapides</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2"
                        onClick={() => {
                          // Ici on pourrait déclencher l'action directement dans Jarvis
                          console.log('Quick action:', action.action);
                        }}
                      >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs text-center">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Tâches Suggérées Aujourd'hui
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <PhoneCall className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Rappeler Mme Dupont (réparation terminée)</span>
                        </div>
                        <Badge variant="outline">Urgent</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Commander écrans iPhone 13 (stock: 2)</span>
                        </div>
                        <Badge variant="outline">Recommandé</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Analyser les performances de la semaine</span>
                        </div>
                        <Badge variant="outline">Optionnel</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-900">Jarvis apprend de vous</h3>
                      <p className="text-green-700 text-sm">
                        Plus vous interagissez avec Jarvis, plus ses recommandations deviennent précises et personnalisées à votre activité.
                      </p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Commencer la conversation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantDashboard;