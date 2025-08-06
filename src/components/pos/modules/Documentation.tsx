import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Settings, 
  Wifi, 
  Printer, 
  CreditCard, 
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: BookOpen,
      content: {
        title: 'Guide de démarrage rapide',
        steps: [
          'Connexion avec vos identifiants administrateur',
          'Configuration du terminal de caisse',
          'Test des périphériques matériels',
          'Formation du personnel aux fonctionnalités de base',
          'Première vente test'
        ]
      }
    },
    {
      id: 'hardware',
      title: 'Matériel compatible',
      icon: Settings,
      content: {
        title: 'Compatibilité matérielle',
        categories: [
          {
            name: 'Scanners Code-barres',
            items: ['USB HID standard', 'Bluetooth Low Energy', 'Scanners 1D/2D']
          },
          {
            name: 'Imprimantes',
            items: ['Imprimantes thermiques 80mm', 'ESC/POS compatible', 'USB et Bluetooth']
          },
          {
            name: 'Tiroirs-caisse',
            items: ['Interface RJ11/RJ12', 'Déclenchement électronique', 'Compatible ESC/POS']
          }
        ]
      }
    },
    {
      id: 'payments',
      title: 'Moyens de paiement',
      icon: CreditCard,
      content: {
        title: 'Configuration des paiements',
        methods: [
          { name: 'Carte bancaire', status: 'active', config: 'Terminal TPE requis' },
          { name: 'Espèces', status: 'active', config: 'Tiroir-caisse configuré' },
          { name: 'Chèque', status: 'active', config: 'Validation manuelle' },
          { name: 'Paiement mobile', status: 'beta', config: 'NFC activé' }
        ]
      }
    },
    {
      id: 'offline',
      title: 'Mode hors ligne',
      icon: Wifi,
      content: {
        title: 'Fonctionnement hors connexion',
        features: [
          'Stockage local des transactions',
          'Synchronisation automatique',
          'Cache intelligent des données',
          'Indicateur de statut réseau',
          'File d\'attente de synchronisation'
        ]
      }
    },
    {
      id: 'compliance',
      title: 'Conformité NF525',
      icon: FileText,
      content: {
        title: 'Conformité réglementaire',
        requirements: [
          { item: 'Inaltérabilité des données', status: 'compliant' },
          { item: 'Sécurisation des données', status: 'compliant' },
          { item: 'Conservation des données', status: 'compliant' },
          { item: 'Archivage sécurisé', status: 'compliant' },
          { item: 'Journalisation des événements', status: 'compliant' }
        ]
      }
    },
    {
      id: 'troubleshooting',
      title: 'Dépannage',
      icon: AlertTriangle,
      content: {
        title: 'Résolution des problèmes courants',
        issues: [
          {
            problem: 'Scanner ne fonctionne pas',
            solution: 'Vérifier la connexion USB/Bluetooth et les permissions navigateur'
          },
          {
            problem: 'Imprimante ne répond pas',
            solution: 'Contrôler l\'alimentation et la configuration ESC/POS'
          },
          {
            problem: 'Synchronisation échoue',
            solution: 'Vérifier la connexion internet et les données en attente'
          },
          {
            problem: 'Erreur de paiement',
            solution: 'Contrôler la configuration du terminal et les paramètres'
          }
        ]
      }
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentation POS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Navigation */}
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {section.title}
                  </Button>
                );
              })}
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {currentSection && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{currentSection.content.title}</h3>
                  
                  {/* Getting Started */}
                  {activeSection === 'getting-started' && (
                    <div className="space-y-3">
                      {currentSection.content.steps?.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hardware */}
                  {activeSection === 'hardware' && (
                    <div className="space-y-4">
                      {currentSection.content.categories?.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{category.name}</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payments */}
                  {activeSection === 'payments' && (
                    <div className="space-y-3">
                      {currentSection.content.methods?.map((method, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4" />
                            <span>{method.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                              {method.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{method.config}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Offline */}
                  {activeSection === 'offline' && (
                    <div className="space-y-3">
                      {currentSection.content.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Compliance */}
                  {activeSection === 'compliance' && (
                    <div className="space-y-3">
                      {currentSection.content.requirements?.map((req, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span>{req.item}</span>
                          <Badge variant={req.status === 'compliant' ? 'default' : 'destructive'}>
                            {req.status === 'compliant' ? 'Conforme' : 'Non conforme'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Troubleshooting */}
                  {activeSection === 'troubleshooting' && (
                    <div className="space-y-4">
                      {currentSection.content.issues?.map((issue, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium text-red-600 mb-2">{issue.problem}</h4>
                          <p className="text-sm text-muted-foreground">{issue.solution}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Liens utiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentation NF525
            </Button>
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Support technique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};