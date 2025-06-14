import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PlanName = "Gratuit" | "Basique" | "Premium" | "Enterprise";

const PLANS: PlanName[] = ["Gratuit", "Basique", "Premium", "Enterprise"];

const FEATURES = [
  // Fonctionnalités implémentées
  { key: "search_brand_model", name: "Recherche par marque ET modèle spécifique" },
  { key: "filter_issue_type", name: "Filtres par type de panne" },
  { key: "geolocation", name: "Géolocalisation automatique" },
  { key: "sorting_advanced", name: "Tri par distance, prix, délai ou note" },
  // Fonctionnalités client
  { key: "client_dashboard", name: "Espace client complet avec tableau de bord" },
  { key: "repair_history", name: "Historique des réparations" },
  { key: "appointments_management", name: "Gestion des rendez-vous" },
  { key: "favorites_system", name: "Système de favoris" },
  { key: "loyalty_program", name: "Programme de fidélité avec points" },
  // Système de tarification
  { key: "price_comparator", name: "Comparateur de prix entre réparateurs" },
  { key: "market_analysis", name: "Analyse du marché avec statistiques" },
  { key: "public_pricing_grid", name: "Grille tarifaire publique" },
  { key: "savings_calculator", name: "Calcul d'économies par rapport à la moyenne" },
  // Outils pour réparateurs
  { key: "repairer_dashboard", name: "Tableau de bord réparateur complet" },
  { key: "orders_management", name: "Gestion des commandes avec statuts" },
  { key: "billing_system", name: "Système de facturation intégré" },
  { key: "parts_inventory", name: "Gestion des stocks de pièces" },
  { key: "repair_scheduling", name: "Planification des réparations" },
  // Analyse et reporting
  { key: "performance_stats", name: "Statistiques de performance" },
  { key: "financial_reports", name: "Rapports financiers (CA, marge)" },
  { key: "business_dashboards", name: "Tableaux de bord métier" },
  { key: "detailed_analytics", name: "Analytics détaillé" },
  // Authentification et profils
  { key: "personal_spaces", name: "Espaces personnels clients et réparateurs" },
  { key: "review_system", name: "Système de revues et notes" },
  { key: "profiles_history", name: "Profils complets avec historique" },
  // Communication
  { key: "realtime_notifications", name: "Système de notifications en temps réel" },
  { key: "integrated_chat", name: "Chat intégré entre clients et réparateurs" },
  { key: "automatic_reminders", name: "Rappels automatiques" },
  { key: "client_support", name: "Support client" },
  // Fonctionnalités existantes
  { key: "parts_marketplace", name: "Marketplace de pièces détachées" },
  { key: "ai_prediag", name: "Pré-diagnostic IA" },
  { key: "time_slot_booking", name: "Prise de rendez-vous intelligente" },
  { key: "notifications", name: "Notifications temps réel" },
  { key: "analytics", name: "Rapports et analytics avancés" },
  { key: "referral_program", name: "Programme de parrainage" },
  { key: "billing_invoice", name: "Facturation intégrée" },
  { key: "repair_tracking", name: "Suivi de réparation temps réel" },
  // Fonctionnalités écologiques
  { key: "eco_score", name: "Score écologique des réparateurs" },
  { key: "carbon_impact", name: "Calcul d'impact carbone évité" },
  { key: "recycling_program", name: "Programme de recyclage des pièces" },
  { key: "eco_certifications", name: "Certifications environnementales" },
  { key: "green_parts", name: "Pièces reconditionnées et éco-responsables" },
  { key: "sustainability_reports", name: "Rapports de durabilité" },
  // Gamification et engagement
  { key: "badges_system", name: "Système de badges et récompenses" },
  { key: "monthly_rankings", name: "Classements mensuels des réparateurs" },
  { key: "community_challenges", name: "Défis communautaires" },
  { key: "ambassador_program", name: "Programme ambassadeur" },
  { key: "achievement_unlocks", name: "Déblocage de réalisations" },
  { key: "leaderboards", name: "Tableaux de classement interactifs" },
  { key: "reward_points", name: "Système de points récompense" },
  // Gestion multi-ateliers
  { key: "multi_workshop_management", name: "Gestion multi-ateliers" },
  { key: "centralized_inventory", name: "Inventaire centralisé multi-sites" },
  { key: "inter_workshop_transfers", name: "Transferts entre ateliers" },
  { key: "unified_reporting", name: "Rapports unifiés multi-ateliers" },
  { key: "workshop_performance", name: "Performance par atelier" },
  { key: "resource_allocation", name: "Allocation des ressources inter-ateliers" },
  { key: "franchise_management", name: "Gestion de franchise" },
  // Analyse avancée
  { key: "predictive_analytics", name: "Analyse prédictive" },
  { key: "market_trends", name: "Tendances de marché en temps réel" },
  { key: "customer_behavior", name: "Analyse comportementale des clients" },
  { key: "demand_forecasting", name: "Prévision de la demande" },
  { key: "price_optimization", name: "Optimisation dynamique des prix" },
  { key: "competitive_analysis", name: "Analyse concurrentielle" },
  { key: "sentiment_analysis", name: "Analyse de sentiment des avis" },
  { key: "custom_dashboards", name: "Tableaux de bord personnalisables" },
  { key: "data_export", name: "Export de données avancé" },
  { key: "real_time_metrics", name: "Métriques en temps réel" }
];

interface FeatureFlag {
  id: string;
  plan_name: PlanName;
  feature_key: string;
  enabled: boolean;
}

export default function AdminFeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Récupérer les flags existants
  useEffect(() => {
    setLoading(true);
    supabase
      .from("feature_flags_by_plan")
      .select("*")
      .then(({ data, error }) => {
        // Force-cast plan_name to PlanName (it is ensured by our PLANS const)
        if (data) {
          setFlags(
            data
              .filter(flag => PLANS.includes(flag.plan_name as PlanName))
              .map(flag => ({
                ...flag,
                plan_name: flag.plan_name as PlanName
              }))
          );
        } else {
          setFlags([]);
        }
        setLoading(false);
        if (error) toast({ title: "Erreur chargement", description: error.message });
      });
  }, []);

  // Générer le mapping plan/feature/flag rapide pour affichage
  const getFlag = (plan: PlanName, featureKey: string) =>
    flags.find(f => f.plan_name === plan && f.feature_key === featureKey);

  // Handler pour changer une case à cocher
  const handleChange = (plan: PlanName, featureKey: string, value: boolean) => {
    setFlags(old =>
      old.map(f =>
        f.plan_name === plan && f.feature_key === featureKey
          ? { ...f, enabled: value }
          : f
      )
    );
  };

  // Sauvegarde en base
  const handleSave = async () => {
    setSaving(true);
    let ok = true;
    for (const plan of PLANS) {
      for (const feature of FEATURES) {
        const flag = getFlag(plan, feature.key);
        if (flag) {
          // Update seulement si flag existe déjà (PATCH)
          const { error } = await supabase
            .from("feature_flags_by_plan")
            .update({ enabled: flag.enabled, updated_at: new Date().toISOString() })
            .eq("id", flag.id);
          if (error) {
            ok = false;
            toast({ title: `Erreur`, description: error.message });
          }
        } else {
          // Sinon on insère (INSERT)
          const { error } = await supabase.from("feature_flags_by_plan").insert([
            {
              plan_name: plan,
              feature_key: feature.key,
              enabled: false,
            },
          ]);
          if (error) {
            ok = false;
            toast({ title: `Erreur`, description: error.message });
          }
        }
      }
    }
    setSaving(false);
    if (ok) toast({ title: "Sauvegarde réussie", description: "Les fonctionnalités par plan ont été mises à jour." });
  };

  if (loading) return <div className="p-8 text-center">Chargement…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des fonctionnalités par plan</CardTitle>
        <div className="text-muted-foreground text-sm mt-1">
          Activez ou désactivez les différentes fonctionnalités pour chaque plan d'abonnement.
          <div className="mt-2 text-xs font-medium">
            📊 {FEATURES.length} fonctionnalités disponibles
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonctionnalité</TableHead>
              {PLANS.map(plan => (
                <TableHead key={plan} className="text-center">{plan}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {FEATURES.map(feature => (
              <TableRow key={feature.key}>
                <TableCell>{feature.name}</TableCell>
                {PLANS.map(plan => {
                  const flag = getFlag(plan, feature.key);
                  return (
                    <TableCell className="text-center" key={plan}>
                      <Switch
                        checked={flag ? flag.enabled : false}
                        onCheckedChange={(v) => handleChange(plan, feature.key, v)}
                        aria-label={`Activation ${feature.name} pour le plan ${plan}`}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="mt-6"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  );
}
