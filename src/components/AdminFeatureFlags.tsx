
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Types de plans d'abonnement disponibles
 */
type PlanName = "Gratuit" | "Basique" | "Premium" | "Enterprise";

/**
 * Plans d'abonnement disponibles dans l'ordre de montée en gamme
 */
const PLANS: PlanName[] = ["Gratuit", "Basique", "Premium", "Enterprise"];

/**
 * Structure pour une fonctionnalité avec sa clé et son nom d'affichage
 */
interface Feature {
  key: string;
  name: string;
  category: string;
}

/**
 * Toutes les fonctionnalités disponibles organisées par catégorie
 */
const FEATURES: Feature[] = [
  // Fonctionnalités de base déjà implémentées
  { key: "search_brand_model", name: "Recherche par marque ET modèle spécifique", category: "Base" },
  { key: "filter_issue_type", name: "Filtres par type de panne", category: "Base" },
  { key: "geolocation", name: "Géolocalisation automatique", category: "Base" },
  { key: "sorting_advanced", name: "Tri par distance, prix, délai ou note", category: "Base" },

  // Espace client
  { key: "client_dashboard", name: "Espace client complet avec tableau de bord", category: "Client" },
  { key: "repair_history", name: "Historique des réparations", category: "Client" },
  { key: "appointments_management", name: "Gestion des rendez-vous", category: "Client" },
  { key: "favorites_system", name: "Système de favoris", category: "Client" },
  { key: "loyalty_program", name: "Programme de fidélité avec points", category: "Client" },

  // Système de tarification
  { key: "price_comparator", name: "Comparateur de prix entre réparateurs", category: "Tarification" },
  { key: "market_analysis", name: "Analyse du marché avec statistiques", category: "Tarification" },
  { key: "public_pricing_grid", name: "Grille tarifaire publique", category: "Tarification" },
  { key: "savings_calculator", name: "Calcul d'économies par rapport à la moyenne", category: "Tarification" },

  // Outils pour réparateurs
  { key: "repairer_dashboard", name: "Tableau de bord réparateur complet", category: "Réparateur" },
  { key: "orders_management", name: "Gestion des commandes avec statuts", category: "Réparateur" },
  { key: "billing_system", name: "Système de facturation intégré", category: "Réparateur" },
  { key: "parts_inventory", name: "Gestion des stocks de pièces", category: "Réparateur" },
  { key: "repair_scheduling", name: "Planification des réparations", category: "Réparateur" },

  // Analyse et reporting
  { key: "performance_stats", name: "Statistiques de performance", category: "Analytics" },
  { key: "financial_reports", name: "Rapports financiers (CA, marge)", category: "Analytics" },
  { key: "business_dashboards", name: "Tableaux de bord métier", category: "Analytics" },
  { key: "detailed_analytics", name: "Analytics détaillé", category: "Analytics" },

  // Authentification et profils
  { key: "personal_spaces", name: "Espaces personnels clients et réparateurs", category: "Auth" },
  { key: "review_system", name: "Système de revues et notes", category: "Auth" },
  { key: "profiles_history", name: "Profils complets avec historique", category: "Auth" },

  // Communication
  { key: "realtime_notifications", name: "Système de notifications en temps réel", category: "Communication" },
  { key: "integrated_chat", name: "Chat intégré entre clients et réparateurs", category: "Communication" },
  { key: "automatic_reminders", name: "Rappels automatiques", category: "Communication" },
  { key: "client_support", name: "Support client", category: "Communication" },

  // Fonctionnalités marketplace
  { key: "parts_marketplace", name: "Marketplace de pièces détachées", category: "Marketplace" },
  { key: "ai_prediag", name: "Pré-diagnostic IA", category: "Marketplace" },
  { key: "time_slot_booking", name: "Prise de rendez-vous intelligente", category: "Marketplace" },
  { key: "notifications", name: "Notifications temps réel", category: "Marketplace" },
  { key: "analytics", name: "Rapports et analytics avancés", category: "Marketplace" },
  { key: "referral_program", name: "Programme de parrainage", category: "Marketplace" },
  { key: "billing_invoice", name: "Facturation intégrée", category: "Marketplace" },
  { key: "repair_tracking", name: "Suivi de réparation temps réel", category: "Marketplace" },

  // Fonctionnalités écologiques
  { key: "eco_score", name: "Score écologique des réparateurs", category: "Écologie" },
  { key: "carbon_impact", name: "Calcul d'impact carbone évité", category: "Écologie" },
  { key: "recycling_program", name: "Programme de recyclage des pièces", category: "Écologie" },
  { key: "eco_certifications", name: "Certifications environnementales", category: "Écologie" },
  { key: "green_parts", name: "Pièces reconditionnées et éco-responsables", category: "Écologie" },
  { key: "sustainability_reports", name: "Rapports de durabilité", category: "Écologie" },

  // Gamification et engagement
  { key: "badges_system", name: "Système de badges et récompenses", category: "Gamification" },
  { key: "monthly_rankings", name: "Classements mensuels des réparateurs", category: "Gamification" },
  { key: "community_challenges", name: "Défis communautaires", category: "Gamification" },
  { key: "ambassador_program", name: "Programme ambassadeur", category: "Gamification" },
  { key: "achievement_unlocks", name: "Déblocage de réalisations", category: "Gamification" },
  { key: "leaderboards", name: "Tableaux de classement interactifs", category: "Gamification" },
  { key: "reward_points", name: "Système de points récompense", category: "Gamification" },

  // Gestion multi-ateliers
  { key: "multi_workshop_management", name: "Gestion multi-ateliers", category: "Multi-Ateliers" },
  { key: "centralized_inventory", name: "Inventaire centralisé multi-sites", category: "Multi-Ateliers" },
  { key: "inter_workshop_transfers", name: "Transferts entre ateliers", category: "Multi-Ateliers" },
  { key: "unified_reporting", name: "Rapports unifiés multi-ateliers", category: "Multi-Ateliers" },
  { key: "workshop_performance", name: "Performance par atelier", category: "Multi-Ateliers" },
  { key: "resource_allocation", name: "Allocation des ressources inter-ateliers", category: "Multi-Ateliers" },
  { key: "franchise_management", name: "Gestion de franchise", category: "Multi-Ateliers" },

  // Analyse avancée
  { key: "predictive_analytics", name: "Analyse prédictive", category: "Analyse Avancée" },
  { key: "market_trends", name: "Tendances de marché en temps réel", category: "Analyse Avancée" },
  { key: "customer_behavior", name: "Analyse comportementale des clients", category: "Analyse Avancée" },
  { key: "demand_forecasting", name: "Prévision de la demande", category: "Analyse Avancée" },
  { key: "price_optimization", name: "Optimisation dynamique des prix", category: "Analyse Avancée" },
  { key: "competitive_analysis", name: "Analyse concurrentielle", category: "Analyse Avancée" },
  { key: "sentiment_analysis", name: "Analyse de sentiment des avis", category: "Analyse Avancée" },
  { key: "custom_dashboards", name: "Tableaux de bord personnalisables", category: "Analyse Avancée" },
  { key: "data_export", name: "Export de données avancé", category: "Analyse Avancée" },
  { key: "real_time_metrics", name: "Métriques en temps réel", category: "Analyse Avancée" }
];

/**
 * Structure d'un flag de fonctionnalité en base de données
 */
interface FeatureFlag {
  id: string;
  plan_name: PlanName;
  feature_key: string;
  enabled: boolean;
}

/**
 * Composant principal pour la gestion des fonctionnalités par plan d'abonnement
 * Permet d'activer/désactiver chaque fonctionnalité pour chaque plan
 */
export default function AdminFeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Charge les flags existants depuis la base de données au montage du composant
   */
  useEffect(() => {
    loadFeatureFlags();
  }, []);

  /**
   * Charge tous les feature flags depuis Supabase
   */
  const loadFeatureFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feature_flags_by_plan")
        .select("*");

      if (error) {
        toast({ 
          title: "Erreur de chargement", 
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Filtrer et typer les données
      const validFlags = (data || [])
        .filter(flag => PLANS.includes(flag.plan_name as PlanName))
        .map(flag => ({
          ...flag,
          plan_name: flag.plan_name as PlanName
        }));

      setFlags(validFlags);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les fonctionnalités",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Trouve un flag spécifique pour un plan et une fonctionnalité donnés
   */
  const getFlag = (plan: PlanName, featureKey: string): FeatureFlag | undefined => {
    return flags.find(f => f.plan_name === plan && f.feature_key === featureKey);
  };

  /**
   * Met à jour l'état local d'un flag (sans sauvegarder en base)
   */
  const handleToggleFlag = (plan: PlanName, featureKey: string, enabled: boolean) => {
    setFlags(currentFlags => {
      const existingFlag = currentFlags.find(f => 
        f.plan_name === plan && f.feature_key === featureKey
      );

      if (existingFlag) {
        // Mise à jour d'un flag existant
        return currentFlags.map(f =>
          f.plan_name === plan && f.feature_key === featureKey
            ? { ...f, enabled }
            : f
        );
      } else {
        // Création d'un nouveau flag local (sera créé en base lors de la sauvegarde)
        return [...currentFlags, {
          id: `temp-${Date.now()}`, // ID temporaire
          plan_name: plan,
          feature_key: featureKey,
          enabled
        }];
      }
    });
  };

  /**
   * Sauvegarde tous les changements en base de données
   */
  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    try {
      // Traiter chaque combinaison plan/fonctionnalité
      for (const plan of PLANS) {
        for (const feature of FEATURES) {
          const localFlag = getFlag(plan, feature.key);
          
          if (localFlag && localFlag.id.startsWith('temp-')) {
            // Créer un nouveau flag en base
            const { error } = await supabase
              .from("feature_flags_by_plan")
              .insert([{
                plan_name: plan,
                feature_key: feature.key,
                enabled: localFlag.enabled,
              }]);

            if (error) {
              console.error(`Erreur création ${plan}/${feature.key}:`, error);
              hasError = true;
            }
          } else if (localFlag) {
            // Mettre à jour un flag existant
            const { error } = await supabase
              .from("feature_flags_by_plan")
              .update({ 
                enabled: localFlag.enabled, 
                updated_at: new Date().toISOString() 
              })
              .eq("id", localFlag.id);

            if (error) {
              console.error(`Erreur mise à jour ${plan}/${feature.key}:`, error);
              hasError = true;
            }
          }
        }
      }

      if (hasError) {
        toast({ 
          title: "Erreurs lors de la sauvegarde", 
          description: "Certaines fonctionnalités n'ont pas pu être sauvegardées",
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Sauvegarde réussie", 
          description: "Les fonctionnalités ont été mises à jour avec succès"
        });
        // Recharger les données pour obtenir les vrais IDs
        await loadFeatureFlags();
      }
    } catch (error) {
      console.error("Erreur générale:", error);
      toast({ 
        title: "Erreur", 
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Groupe les fonctionnalités par catégorie pour un affichage organisé
   */
  const featuresByCategory = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Chargement des fonctionnalités...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des fonctionnalités par plan</CardTitle>
        <div className="text-muted-foreground text-sm">
          Configurez quelles fonctionnalités sont disponibles pour chaque plan d'abonnement.
          <div className="mt-2 text-xs font-medium text-blue-600">
            📊 {FEATURES.length} fonctionnalités • {Object.keys(featuresByCategory).length} catégories
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                {category} ({features.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Fonctionnalité</TableHead>
                    {PLANS.map(plan => (
                      <TableHead key={plan} className="text-center min-w-[100px]">
                        {plan}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map(feature => (
                    <TableRow key={feature.key}>
                      <TableCell className="font-medium">
                        {feature.name}
                      </TableCell>
                      {PLANS.map(plan => {
                        const flag = getFlag(plan, feature.key);
                        return (
                          <TableCell className="text-center" key={plan}>
                            <Switch
                              checked={flag?.enabled || false}
                              onCheckedChange={(enabled) => 
                                handleToggleFlag(plan, feature.key, enabled)
                              }
                              aria-label={`${feature.name} pour le plan ${plan}`}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full sm:w-auto"
          >
            {saving ? "Enregistrement en cours..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
