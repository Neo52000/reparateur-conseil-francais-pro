import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabaseMvpd } from "@/integrations/supabase/mvpd";

interface LeadRow {
  id: string;
  status: string;
  delivered_at: string;
  credits_spent: number;
  issue_requests: {
    postal_code: string;
    device_type: string | null;
    brand: string | null;
    symptom: string;
    contact_name: string | null;
  } | null;
}

const STATUS_LABEL: Record<string, string> = {
  delivered: "Reçu",
  contacted: "Contacté",
  converted: "Converti",
  lost: "Perdu",
  refunded: "Remboursé",
};

const LeadsListPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/repairer-auth", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabaseMvpd
        .from("lead_deliveries")
        .select(
          "id, status, delivered_at, credits_spent, issue_requests(postal_code, device_type, brand, symptom, contact_name)",
        )
        .order("delivered_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setLeads((data ?? []) as unknown as LeadRow[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mes leads — Espace pro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mes leads</h1>
          <Button variant="outline" asChild>
            <Link to="/pro/wallet">Voir mon solde de crédits</Link>
          </Button>
        </div>

        {loading && <p className="text-muted-foreground">Chargement…</p>}
        {error && <p className="text-destructive">Erreur : {error}</p>}
        {!loading && !error && leads.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun lead pour le moment. Vérifiez votre solde de crédits et vos zones d'intervention.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {leads.map((lead) => (
            <Link key={lead.id} to={`/pro/leads/${lead.id}`} className="block">
              <Card className="hover:bg-accent/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">
                    {lead.issue_requests?.device_type ?? "Appareil"} ·{" "}
                    {lead.issue_requests?.brand ?? "marque inconnue"}
                  </CardTitle>
                  <Badge variant="secondary">{STATUS_LABEL[lead.status] ?? lead.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm line-clamp-2">{lead.issue_requests?.symptom}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>CP {lead.issue_requests?.postal_code}</span>
                    <span>· {lead.credits_spent} crédit{lead.credits_spent > 1 ? "s" : ""}</span>
                    <span>· reçu le {new Date(lead.delivered_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LeadsListPage;
