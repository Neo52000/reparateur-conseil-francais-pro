
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
  { key: "parts_marketplace", name: "Marketplace de pièces détachées" },
  { key: "ai_prediag", name: "Pré-diagnostic IA" },
  { key: "time_slot_booking", name: "Prise de rendez-vous intelligente" },
  { key: "notifications", name: "Notifications temps réel" },
  { key: "analytics", name: "Rapports et analytics avancés" },
  { key: "referral_program", name: "Programme de parrainage" },
  { key: "billing_invoice", name: "Facturation intégrée" },
  { key: "repair_tracking", name: "Suivi de réparation temps réel" },
  // Ajouter ici les nouvelles fonctionnalités si besoin
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
        <div className="text-muted-foreground text-sm mt-1">Activez ou désactivez les différentes fonctionnalités pour chaque plan d’abonnement.</div>
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
