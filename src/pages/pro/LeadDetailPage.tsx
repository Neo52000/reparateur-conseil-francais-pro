import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { supabaseMvpd } from "@/integrations/supabase/mvpd";

interface IssueDetail {
  postal_code: string;
  device_type: string | null;
  brand: string | null;
  model: string | null;
  symptom: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  diagnosis_ai: Record<string, unknown> | null;
}

interface LeadDetail {
  id: string;
  status: string;
  credits_spent: number;
  delivered_at: string;
  conversion_value_cents: number | null;
  notes: string | null;
  issue_requests: IssueDetail | null;
}

type Status = "delivered" | "contacted" | "converted" | "lost";

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conversionValue, setConversionValue] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/repairer-auth", { replace: true });
      return;
    }
    if (!id) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabaseMvpd
        .from("lead_deliveries")
        .select(
          "id, status, credits_spent, delivered_at, conversion_value_cents, notes, issue_requests(postal_code, device_type, brand, model, symptom, contact_name, contact_email, contact_phone, diagnosis_ai)",
        )
        .eq("id", id)
        .single();
      if (cancelled) return;
      if (error) {
        toast({
          title: "Lead introuvable",
          description: error.message,
          variant: "destructive",
        });
        navigate("/pro/leads");
        return;
      }
      setLead(data as unknown as LeadDetail);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading, navigate, toast]);

  const updateStatus = async (status: Status) => {
    if (!lead) return;
    setSaving(true);
    const parsed = parseFloat(conversionValue.replace(",", "."));
    const conversion = status === "converted" && Number.isFinite(parsed)
      ? Math.round(parsed * 100)
      : undefined;
    const { data, error } = await supabase.functions.invoke("lead-status-update", {
      body: {
        lead_id: lead.id,
        status,
        conversion_value_cents: conversion,
      },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast({
        title: "Mise à jour impossible",
        description: error?.message ?? data?.error ?? "Erreur inconnue",
        variant: "destructive",
      });
      return;
    }
    setLead({ ...lead, status });
    toast({ title: "Statut mis à jour", description: `Lead marqué « ${status} ».` });
  };

  if (loading || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  const issue = lead.issue_requests;
  const diag = issue?.diagnosis_ai as Record<string, unknown> | null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Détail lead — Espace pro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/pro/leads">← Retour à mes leads</Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contact client</span>
              <Badge>{lead.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issue?.contact_name && <p><strong>Nom :</strong> {issue.contact_name}</p>}
            {issue?.contact_email && (
              <p>
                <strong>Email :</strong>{" "}
                <a className="text-primary underline" href={`mailto:${issue.contact_email}`}>
                  {issue.contact_email}
                </a>
              </p>
            )}
            {issue?.contact_phone && (
              <p>
                <strong>Téléphone :</strong>{" "}
                <a className="text-primary underline" href={`tel:${issue.contact_phone}`}>
                  {issue.contact_phone}
                </a>
              </p>
            )}
            <p><strong>Code postal :</strong> {issue?.postal_code}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Demande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <strong>Appareil :</strong> {issue?.device_type ?? "—"}
              {issue?.brand && <> · {issue.brand}</>}
              {issue?.model && <> · {issue.model}</>}
            </p>
            <p>{issue?.symptom}</p>
          </CardContent>
        </Card>

        {diag && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Diagnostic IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {typeof diag.diagnostic_probable === "string" && (
                <p>{diag.diagnostic_probable}</p>
              )}
              {diag.estimation_prix_eur && typeof diag.estimation_prix_eur === "object" && (
                <p>
                  <strong>Estimation :</strong>{" "}
                  {(diag.estimation_prix_eur as { min: number; max: number }).min} € –{" "}
                  {(diag.estimation_prix_eur as { min: number; max: number }).max} €
                </p>
              )}
              {Array.isArray(diag.causes_possibles) && diag.causes_possibles.length > 0 && (
                <div>
                  <strong>Causes probables :</strong>
                  <ul className="list-disc list-inside text-sm">
                    {(diag.causes_possibles as string[]).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => updateStatus("contacted")}
                disabled={saving || lead.status === "contacted"}
              >
                Client contacté
              </Button>
              <Button
                onClick={() => updateStatus("converted")}
                disabled={saving || lead.status === "converted"}
              >
                Marqué comme converti
              </Button>
              <Button
                variant="destructive"
                onClick={() => updateStatus("lost")}
                disabled={saving || lead.status === "lost"}
              >
                Lead perdu
              </Button>
            </div>
            <div>
              <Label htmlFor="conversion">Montant facturé (€) — si converti</Label>
              <Input
                id="conversion"
                inputMode="decimal"
                placeholder="ex : 89,90"
                value={conversionValue}
                onChange={(e) => setConversionValue(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LeadDetailPage;
