import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';

const faqCategories = [
  {
    id: 'pos',
    name: 'POS & Caisse',
    icon: '🧾',
    questions: [
      {
        q: "Le système POS est-il vraiment certifié NF525 ?",
        a: "Oui, notre système POS est entièrement certifié NF525 et respecte toutes les obligations légales françaises. Vous recevez automatiquement un certificat de conformité."
      },
      {
        q: "Puis-je importer mes anciens clients et produits ?",
        a: "Absolument. Nous proposons un service d'import gratuit depuis Excel, CSV ou votre ancien logiciel. Notre équipe vous accompagne dans la migration."
      },
      {
        q: "Comment fonctionne la gestion des stocks ?",
        a: "Le stock se met à jour automatiquement à chaque vente. Vous pouvez définir des seuils d'alerte et recevoir des notifications quand un produit est en rupture."
      },
      {
        q: "Puis-je utiliser le POS hors ligne ?",
        a: "Oui, le POS fonctionne en mode déconnecté. Les données se synchronisent automatiquement dès que la connexion est rétablie."
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'Boutique en ligne',
    icon: '🛍️',
    questions: [
      {
        q: "Combien de temps faut-il pour mettre en ligne ma boutique ?",
        a: "Votre boutique peut être en ligne en moins de 24h. Nous créons automatiquement vos pages produits à partir de votre catalogue existant."
      },
      {
        q: "Puis-je personnaliser le design de ma boutique ?",
        a: "Oui, vous pouvez personnaliser les couleurs, le logo, les bannières et l'organisation des produits. Nous proposons plusieurs thèmes professionnels."
      },
      {
        q: "Comment gérer les livraisons et les paiements ?",
        a: "Nous intégrons Stripe pour les paiements et les principaux transporteurs (Colissimo, Chronopost). Vous définissez vos zones et tarifs de livraison."
      },
      {
        q: "Les stocks sont-ils synchronisés avec le magasin physique ?",
        a: "Parfaitement. Quand vous vendez un produit en magasin, il se retire automatiquement du stock en ligne et vice-versa."
      }
    ]
  },
  {
    id: 'seo',
    name: 'Référencement local',
    icon: '📍',
    questions: [
      {
        q: "Comment améliorer ma visibilité locale sur Google ?",
        a: "Nous créons automatiquement vos pages SEO locales optimisées et gérons votre fiche Google My Business pour maximiser votre visibilité."
      },
      {
        q: "Combien de temps avant de voir des résultats SEO ?",
        a: "Les premiers effets apparaissent généralement sous 2-4 semaines. Les résultats optimaux sont atteints après 2-3 mois d'optimisation continue."
      },
      {
        q: "Puis-je suivre mes positions sur Google ?",
        a: "Oui, vous avez accès à un tableau de bord SEO avec vos positions, le trafic de vos pages et les mots-clés qui vous apportent des clients."
      },
      {
        q: "Gérez-vous aussi les avis clients ?",
        a: "Nous vous aidons à collecter plus d'avis positifs via des invitations automatiques par SMS/email après chaque réparation réussie."
      }
    ]
  },
  {
    id: 'qualirepar',
    name: 'QualiRépar',
    icon: '🔁',
    questions: [
      {
        q: "Comment automatiser mes déclarations QualiRépar ?",
        a: "Notre module GesCo se connecte directement à la plateforme QualiRépar et transmet automatiquement vos données de réparation."
      },
      {
        q: "Dois-je encore faire de la paperasse ?",
        a: "Non, tout est automatisé. Les certificats d'irréparabilité et les déclarations se génèrent automatiquement selon vos réparations."
      },
      {
        q: "Comment récupérer mes bonus plus rapidement ?",
        a: "Les déclarations étant automatiques et conformes, vos bonus sont versés plus rapidement par QualiRépar. Plus d'erreurs, plus d'attente."
      },
      {
        q: "Le module est-il compatible avec tous les types de réparations ?",
        a: "Oui, smartphones, tablettes, ordinateurs portables, et tous les appareils éligibles QualiRépar sont pris en charge."
      }
    ]
  },
  {
    id: 'pricing',
    name: 'Tarifs & Abonnements',
    icon: '💰',
    questions: [
      {
        q: "Y a-t-il des frais cachés ?",
        a: "Aucun frais caché. Le prix affiché est le prix payé. Pas de frais de transaction, d'installation ou de formation."
      },
      {
        q: "Puis-je changer de plan à tout moment ?",
        a: "Oui, vous pouvez upgrader ou downgrader votre plan depuis votre espace personnel. Les changements sont effectifs immédiatement."
      },
      {
        q: "Que se passe-t-il si je résilie ?",
        a: "Vous gardez accès à vos données pendant 6 mois. Nous pouvons vous fournir une exportation complète de vos données à tout moment."
      },
      {
        q: "Proposez-vous des remises pour les jeunes entreprises ?",
        a: "Oui, nous avons des tarifs préférentiels pour les auto-entrepreneurs et les jeunes entreprises. Contactez-nous pour en savoir plus."
      }
    ]
  },
  {
    id: 'support',
    name: 'Support & Formation',
    icon: '🎓',
    questions: [
      {
        q: "Comment fonctionne le support 7j/7 ?",
        a: "Notre équipe est disponible par chat, email et téléphone de 8h à 22h en semaine et de 10h à 18h le weekend. Temps de réponse moyen : 10 minutes."
      },
      {
        q: "Y a-t-il une formation à l'utilisation ?",
        a: "Oui, formation gratuite de 2h en visio lors de votre installation. Plus des tutoriels vidéo et une documentation complète disponibles 24h/24."
      },
      {
        q: "Puis-je avoir de l'aide pour la migration depuis mon ancien système ?",
        a: "Bien sûr. Notre équipe technique vous accompagne gratuitement dans la migration de vos données et la configuration de votre système."
      },
      {
        q: "Que faire en cas de problème technique urgent ?",
        a: "Nous avons une hotline technique disponible 24h/24 pour les urgences. Votre activité ne doit jamais s'arrêter à cause d'un problème technique."
      }
    ]
  }
];

const RepairerFAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleItem = (categoryId: string, questionIndex: number) => {
    const itemId = `${categoryId}-${questionIndex}`;
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    !selectedCategory || 
    category.id === selectedCategory ||
    category.questions.length > 0
  );

  return (
    <>
      <Helmet>
        <title>FAQ Complète - Toutes vos questions sur TopRéparateurs | Réparateurs</title>
        <meta 
          name="description" 
          content="Toutes les réponses à vos questions sur TopRéparateurs : POS NF525, boutique en ligne, SEO local, QualiRépar, tarifs et support." 
        />
        <meta name="keywords" content="FAQ réparateur, aide TopRéparateurs, questions POS, support technique réparateur" />
        <link rel="canonical" href="https://topreparateurs.fr/repairer/faq" />
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
                <h1 className="text-3xl font-bold text-foreground">FAQ Complète</h1>
                <p className="text-muted-foreground mt-2">
                  Trouvez rapidement les réponses à toutes vos questions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and filters */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Toutes les catégories
              </Button>
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="max-w-4xl mx-auto">
            {filteredCategories.map((category) => (
              <div key={category.id} className="mb-12">
                {(!selectedCategory || selectedCategory === category.id) && category.questions.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="text-3xl">{category.icon}</div>
                      <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                    </div>

                    <div className="space-y-4">
                      {category.questions.map((question, index) => {
                        const itemId = `${category.id}-${index}`;
                        const isOpen = openItems.includes(itemId);

                        return (
                          <Card key={index} className="border transition-all duration-200 hover:shadow-md">
                            <CardContent className="p-0">
                              <button
                                onClick={() => toggleItem(category.id, index)}
                                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                              >
                                <h3 className="text-lg font-semibold text-foreground pr-4">
                                  {question.q}
                                </h3>
                                <div className="flex-shrink-0">
                                  {isOpen ? (
                                    <ChevronUp className="w-5 h-5 text-electric-blue" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                              </button>
                              
                              {isOpen && (
                                <div className="px-6 pb-6">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {question.a}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}

            {filteredCategories.every(cat => cat.questions.length === 0) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Aucune question trouvée pour "{searchTerm}"
                </p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <section className="mt-20">
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Vous ne trouvez pas votre réponse ?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Notre équipe support est là pour vous aider 7j/7
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-electric-blue hover:bg-electric-blue-dark"
                  >
                    <a href="mailto:support@topreparateurs.fr">
                      Contacter le support
                    </a>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    size="lg"
                  >
                    <Link to="/repairer/demo">
                      Réserver une démo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default RepairerFAQ;