import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { supabaseMvpd } from "@/integrations/supabase/mvpd";

interface Pack {
  id: "decouverte" | "standard" | "pro";
  label: string;
  credits: number;
  price: number;
  perLead: number;
  highlighted?: boolean;
}

const PACKS: Pack[] = [
  { id: "decouverte", label: "Découverte", credits: 10, price: 49, perLead: 4.9 },
  { id: "standard", label: "Standard", credits: 30, price: 129, perLead: 4.3, highlighted: true },
  { id: "pro", label: "Pro", credits: 100, price: 379, perLead: 3.79 },
];

interface Transaction {
  id: string;
  delta: number;
  kind: string;
  balance_after: number;
  created_at: string;
  stripe_session_id: string | null;
}

const KIND_LABEL: Record<string, string> = {
  purchase: "Achat",
  spend: "Lead",
  refund: "Remboursement",
  grant: "Bonus",
};

const WalletPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<Pack["id"] | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast({
        title: "Achat confirmé",
        description: "Vos crédits sont en cours de versement (sous quelques secondes).",
      });
      setSearchParams({}, { replace: true });
    } else if (searchParams.get("canceled") === "1") {
      toast({ title: "Achat annulé", variant: "destructive" });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/repairer-auth", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: repairer }, { data: tx }] = await Promise.all([
        supabaseMvpd
          .from("repairers")
          .select("credit_balance")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabaseMvpd
          .from("credit_transactions")
          .select("id, delta, kind, balance_after, created_at, stripe_session_id")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      if (cancelled) return;
      setBalance(repairer?.credit_balance ?? 0);
      setTransactions((tx ?? []) as unknown as Transaction[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const buy = async (pack: Pack["id"]) => {
    setBuying(pack);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout-credits", {
        body: { pack },
      });
      if (error || !data?.success) {
        throw new Error(error?.message ?? data?.error ?? "checkout_failed");
      }
      window.location.assign(data.url as string);
    } catch (err) {
      toast({
        title: "Achat impossible",
        description: err instanceof Error ? err.message : "Erreur Stripe",
        variant: "destructive",
      });
      setBuying(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mon portefeuille — Espace pro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Mon portefeuille</h1>
        <p className="text-muted-foreground mb-6">
          Solde courant :{" "}
          <strong>{loading ? "…" : balance ?? 0} crédit{(balance ?? 0) > 1 ? "s" : ""}</strong>
        </p>

        <h2 className="text-xl font-semibold mb-4">Acheter des crédits</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {PACKS.map((pack) => (
            <Card key={pack.id} className={pack.highlighted ? "border-primary" : undefined}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{pack.label}</span>
                  {pack.highlighted && <Badge>Recommandé</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-bold">{pack.price} € <span className="text-base text-muted-foreground font-normal">HT</span></p>
                <p className="text-sm">{pack.credits} crédits · {pack.perLead.toFixed(2).replace(".", ",")} € / lead</p>
                <Button className="w-full" onClick={() => buy(pack.id)} disabled={buying !== null}>
                  {buying === pack.id ? "Redirection…" : "Acheter"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Historique des transactions</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left bg-muted">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Delta</th>
                    <th className="px-4 py-2 text-right">Solde après</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        Aucune transaction
                      </td>
                    </tr>
                  )}
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-4 py-2">{new Date(t.created_at).toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-2">{KIND_LABEL[t.kind] ?? t.kind}</td>
                      <td className={`px-4 py-2 text-right ${t.delta < 0 ? "text-destructive" : "text-emerald-600"}`}>
                        {t.delta > 0 ? "+" : ""}{t.delta}
                      </td>
                      <td className="px-4 py-2 text-right">{t.balance_after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;
