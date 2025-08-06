
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { FeatureFlagsTable } from "@/components/FeatureFlagsTable";
import { PLANS, FEATURES, getFeaturesByCategory } from "@/constants/features";

/**
 * Composant principal pour la gestion des fonctionnalités par plan d'abonnement
 * Interface administrateur permettant de configurer quelles fonctionnalités 
 * sont disponibles pour chaque plan
 */
export default function AdminFeatureFlags() {
  const {
    loading,
    saving,
    getFlag,
    handleToggleFlag,
    handleSave
  } = useFeatureFlags();

  const featuresByCategory = getFeaturesByCategory();

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
            <FeatureFlagsTable
              key={category}
              category={category}
              features={features}
              plans={PLANS}
              getFlag={getFlag}
              onToggleFlag={handleToggleFlag}
            />
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
