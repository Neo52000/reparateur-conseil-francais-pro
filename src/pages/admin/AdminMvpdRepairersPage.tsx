import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabaseMvpd } from "@/integrations/supabase/mvpd";
import { useNavigate } from "react-router-dom";

interface RepairerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  postal_code: string;
  city: string;
  siret: string | null;
  status: string | null;
  credit_balance: number;
  service_zones: string[];
  specialties: string[];
  qualirepar_certified: boolean;
  created_at: string;
  user_id: string | null;
}

const STATUS_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  active: "default",
  suspended: "destructive",
};

const AdminMvpdRepairersPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<RepairerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "active" | "all">("pending");
  const [grantAmount, setGrantAmount] = useState("5");
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabaseMvpd
      .from("repairers")
      .select(
        "id, name, email, phone, postal_code, city, siret, status, credit_balance, service_zones, specialties, qualirepar_certified, created_at, user_id",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast({ title: "Chargement impossible", description: error.message, variant: "destructive" });
    } else {
      setRows((data ?? []) as RepairerRow[]);
    }
    setLoading(false);
  }, [filter, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/repairer-auth", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }
    void load();
  }, [user, isAdmin, authLoading, load, navigate]);

  const updateStatus = async (id: string, status: "active" | "suspended" | "pending") => {
    setWorking(id);
    const { error } = await supabaseMvpd
      .from("repairers")
      .update({ status })
      .eq("id", id);
    setWorking(null);
    if (error) {
      toast({ title: "MAJ impossible", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Statut mis à jour", description: `Réparateur ${status}.` });
    void load();
  };

  const grantCredits = async (id: string) => {
    const amount = parseInt(grantAmount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Montant invalide", variant: "destructive" });
      return;
    }
    setWorking(id);
    const { error } = await supabaseMvpd.rpc("credit_credits", {
      p_repairer: id,
      p_amount: amount,
      p_session: null,
      p_kind: "grant",
    });
    setWorking(null);
    if (error) {
      toast({ title: "Octroi impossible", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Crédits offerts", description: `+${amount} crédits offerts.` });
    void load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MVP D — Modération réparateurs</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Modération réparateurs MVP D</h1>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <Label>Filtre</Label>
            <div className="flex gap-1 mt-1">
              {(["pending", "active", "all"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="grant">Crédits à offrir (bouton « +X »)</Label>
            <Input
              id="grant"
              type="number"
              min={1}
              max={100}
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
              className="w-32"
            />
          </div>
          <Button variant="outline" onClick={load}>Recharger</Button>
        </div>

        {loading && <p className="text-muted-foreground">Chargement…</p>}
        {!loading && rows.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun réparateur dans cette catégorie.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-base">{r.name}</span>
                  <div className="flex gap-2 items-center">
                    {r.status && (
                      <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>{r.status}</Badge>
                    )}
                    {r.qualirepar_certified && <Badge variant="outline">QualiRépar</Badge>}
                    <span className="text-xs text-muted-foreground">{r.credit_balance} crédits</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  {r.postal_code} {r.city} · {r.email ?? "–"} · {r.phone ?? "–"}
                  {r.siret && <> · SIRET {r.siret}</>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Spécialités : {r.specialties.length > 0 ? r.specialties.join(", ") : "–"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Zones : {r.service_zones.length > 0
                    ? `${r.service_zones.slice(0, 6).join(", ")}${r.service_zones.length > 6 ? "…" : ""}`
                    : "–"}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {r.status !== "active" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(r.id, "active")}
                      disabled={working === r.id}
                    >
                      Activer
                    </Button>
                  )}
                  {r.status !== "suspended" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus(r.id, "suspended")}
                      disabled={working === r.id}
                    >
                      Suspendre
                    </Button>
                  )}
                  {r.status !== "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(r.id, "pending")}
                      disabled={working === r.id}
                    >
                      Remettre en attente
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => grantCredits(r.id)}
                    disabled={working === r.id}
                  >
                    +{grantAmount} crédits
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminMvpdRepairersPage;
