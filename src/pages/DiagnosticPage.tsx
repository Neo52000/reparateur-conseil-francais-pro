import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { supabaseMvpd } from "@/integrations/supabase/mvpd";

interface DiagnosisResult {
  diagnostic_probable: string;
  causes_possibles: string[];
  complexite: "simple" | "moyenne" | "complexe";
  estimation_prix_eur: { min: number; max: number };
  duree_intervention_estimee: string;
  urgence: "low" | "medium" | "high";
  qualirepar_eligible: boolean;
  qualirepar_categorie: string | null;
  questions_complementaires: string[];
}

type Step = "form" | "result" | "contact" | "done";

const URGENCY_LABEL: Record<DiagnosisResult["urgence"], string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};

const URGENCY_VARIANT: Record<DiagnosisResult["urgence"], "secondary" | "default" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

const DiagnosticPage = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [symptom, setSymptom] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const submitDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptom.trim().length < 10) {
      toast({
        title: "Description trop courte",
        description: "Merci de décrire la panne en quelques mots (10 caractères minimum).",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("diagnose-issue", {
        body: {
          deviceType: deviceType.trim(),
          brand: brand.trim(),
          model: model.trim(),
          symptom: symptom.trim(),
          postalCode: postalCode.trim() || undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error ?? "diagnostic_failed");
      setDiagnosis(data.diagnosis as DiagnosisResult);
      setRequestId(data.request_id as string);
      setStep("result");
    } catch (err) {
      toast({
        title: "Diagnostic indisponible",
        description: err instanceof Error ? err.message : "Une erreur est survenue, réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;
    if (!/^\d{5}$/.test(postalCode)) {
      toast({
        title: "Code postal requis",
        description: "Le code postal est nécessaire pour vous mettre en relation avec un réparateur local.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-contact", {
        body: {
          issue_request_id: requestId,
          contact_name: contactName.trim() || undefined,
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          postal_code: postalCode.trim(),
        },
      });
      if (error) throw error;
      if (!data?.success && !data?.already_distributed) {
        throw new Error(data?.error ?? "submit_failed");
      }
      const { error: updateError } = await supabaseMvpd
        .from("issue_requests")
        .update({
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          postal_code: postalCode.trim(),
          status: "awaiting_contact",
        })
        .eq("id", requestId);
      if (updateError) throw updateError;

      const { error: matchError } = await supabase.functions.invoke("match-and-distribute", {
        body: { issue_request_id: requestId },
      });
      if (matchError) throw matchError;

      setStep("done");
      toast({
        title: "Demande envoyée",
        description: "Jusqu'à 3 réparateurs vont vous contacter sous 24 h.",
      });
    } catch (err) {
      toast({
        title: "Envoi impossible",
        description: err instanceof Error ? err.message : "Réessayez dans quelques instants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Diagnostic gratuit IA — TopRéparateurs</title>
        <meta
          name="description"
          content="Décrivez votre panne en quelques mots, notre IA vous donne un diagnostic et une estimation de prix. Recevez 3 devis de réparateurs locaux."
        />
        <link rel="canonical" href="https://topreparateurs.fr/diagnostic" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Diagnostic gratuit</h1>
        <p className="text-muted-foreground mb-8">
          Décrivez la panne — notre IA estime la cause, le prix et la durée d'intervention.
        </p>

        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Votre appareil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitDiagnostic} className="space-y-4">
                <div>
                  <Label htmlFor="deviceType">Type d'appareil *</Label>
                  <Input
                    id="deviceType"
                    placeholder="ex : lave-linge, smartphone, ordinateur portable"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marque</Label>
                    <Input
                      id="brand"
                      placeholder="ex : Bosch"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      maxLength={80}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modèle</Label>
                    <Input
                      id="model"
                      placeholder="ex : WAN28140FF"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      maxLength={120}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="symptom">Description de la panne *</Label>
                  <Textarea
                    id="symptom"
                    placeholder="Le tambour ne tourne plus et un voyant rouge clignote depuis hier soir."
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal (optionnel à cette étape)</Label>
                  <Input
                    id="postalCode"
                    placeholder="75001"
                    inputMode="numeric"
                    pattern="\d{5}"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Analyse en cours…" : "Obtenir mon diagnostic"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "result" && diagnosis && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base">{diagnosis.diagnostic_probable}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Complexité : {diagnosis.complexite}</Badge>
                  <Badge variant={URGENCY_VARIANT[diagnosis.urgence]}>
                    Urgence : {URGENCY_LABEL[diagnosis.urgence]}
                  </Badge>
                  <Badge variant="outline">Durée estimée : {diagnosis.duree_intervention_estimee}</Badge>
                  {diagnosis.qualirepar_eligible && (
                    <Badge>Éligible Bonus Réparation</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Estimation du coût</p>
                  <p className="text-2xl font-bold">
                    {diagnosis.estimation_prix_eur.min} € – {diagnosis.estimation_prix_eur.max} €
                  </p>
                </div>
                {diagnosis.causes_possibles.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Causes probables</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {diagnosis.causes_possibles.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {diagnosis.questions_complementaires.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Questions utiles pour affiner</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {diagnosis.questions_complementaires.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recevoir 3 devis gratuits</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setStep("contact")} className="w-full">
                  Être contacté par un réparateur local
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "contact" && (
          <Card>
            <CardHeader>
              <CardTitle>Vos coordonnées</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitContact} className="space-y-4">
                <div>
                  <Label htmlFor="contactName">Nom (optionnel)</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Téléphone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode2">Code postal *</Label>
                  <Input
                    id="postalCode2"
                    inputMode="numeric"
                    pattern="\d{5}"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Envoi…" : "Recevoir 3 devis gratuits"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Vos coordonnées sont transmises uniquement aux réparateurs sélectionnés.
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "done" && (
          <Card>
            <CardHeader>
              <CardTitle>Demande envoyée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Vous serez recontacté sous 24 h par jusqu'à 3 réparateurs locaux.</p>
              <Button onClick={() => window.location.assign("/")}>Retour à l'accueil</Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DiagnosticPage;
