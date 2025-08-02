import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Users, TrendingUp } from "lucide-react";
import ReviewsList from "@/components/reviews/ReviewsList";
import ReviewForm from "@/components/reviews/ReviewForm";
import RepairerRating from "@/components/reviews/RepairerRating";

const ReviewsDemo = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Demo data
  const demoRepairer = {
    id: "demo-repairer-1",
    name: "TechRepair Pro",
    city: "Paris",
    averageRating: 4.6,
    totalReviews: 127
  };

  const statsCards = [
    {
      title: "Note moyenne",
      value: demoRepairer.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-500"
    },
    {
      title: "Avis clients",
      value: demoRepairer.totalReviews,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Satisfaction",
      value: "92%",
      icon: TrendingUp,
      color: "text-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Système d'Avis et de Réputation
          </h1>
          <p className="text-muted-foreground mt-2">
            Démonstration du système de gestion des avis clients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Liste des Avis</TabsTrigger>
            <TabsTrigger value="add-review">Ajouter un Avis</TabsTrigger>
            <TabsTrigger value="reputation">Réputation</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReviewsList 
                  repairerId={demoRepairer.id}
                  showAddReviewButton={true}
                  onAddReviewClick={() => setShowReviewForm(true)}
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profil Réparateur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h3 className="font-semibold">{demoRepairer.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        📍 {demoRepairer.city}
                      </p>
                      <RepairerRating 
                        averageRating={demoRepairer.averageRating}
                        totalReviews={demoRepairer.totalReviews}
                        size="md"
                      />
                      <Button className="w-full mt-4">
                        Contacter le réparateur
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition des Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.random() * 80 + 10}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {Math.floor(Math.random() * 30 + 5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="add-review">
            <div className="max-w-2xl mx-auto">
              <ReviewForm 
                repairerId={demoRepairer.id}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  // In a real app, we would refresh the reviews list
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="reputation">
            <Card>
              <CardHeader>
                <CardTitle>Système de Réputation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Critères d'évaluation</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Qualité du service (1-5 étoiles)</li>
                        <li>• Respect des délais</li>
                        <li>• Communication</li>
                        <li>• Rapport qualité-prix</li>
                        <li>• Propreté du travail</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Badges de réputation</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500">🏆</span>
                          <span className="text-sm">Expert certifié (4.5+ étoiles)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-500">⚡</span>
                          <span className="text-sm">Réparation rapide</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✅</span>
                          <span className="text-sm">Vérifié (100+ avis)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3">Impact sur le classement</h3>
                    <p className="text-sm text-muted-foreground">
                      Les réparateurs avec les meilleures notes apparaissent en premier 
                      dans les résultats de recherche. Le système prend en compte :
                    </p>
                    <ul className="mt-2 text-sm text-muted-foreground">
                      <li>• Note moyenne pondérée</li>
                      <li>• Nombre total d'avis</li>
                      <li>• Récence des avis</li>
                      <li>• Taux de réponse</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReviewsDemo;