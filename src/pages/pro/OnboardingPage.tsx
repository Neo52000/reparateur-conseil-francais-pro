import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabaseMvpd } from "@/integrations/supabase/mvpd";

type Step = "profil" | "zones" | "specialites" | "qualirepar";
const STEPS: Step[] = ["profil", "zones", "specialites", "qualirepar"];
const STEP_LABEL: Record<Step, string> = {
  profil: "1. Profil",
  zones: "2. Zones d'intervention",
  specialites: "3. Spécialités",
  qualirepar: "4. QualiRépar",
};

const SPECIALITY_OPTIONS = [
  "smartphone",
  "tablette",
  "ordinateur",
  "lave-linge",
  "lave-vaisselle",
  "réfrigérateur",
  "four",
  "TV",
  "console",
  "vélo",
];

const QUALIREPAR_CATEGORIES = [
  "gros électroménager",
  "petit électroménager",
  "informatique",
  "image et son",
  "outillage",
];

const OnboardingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const stepParam = (searchParams.get("step") ?? "profil") as Step;
  const step: Step = STEPS.includes(stepParam) ? stepParam : "profil";

  const [businessName, setBusinessName] = useState("");
  const [siret, setSiret] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [zonesText, setZonesText] = useState("");
  const zones = useMemo(
    () =>
      zonesText
        .split(/[,;\s]+/)
        .map((z) => z.trim())
        .filter((z) => /^\d{5}$/.test(z)),
    [zonesText],
  );

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [qualiCertified, setQualiCertified] = useState(false);
  const [qualiCategories, setQualiCategories] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/repairer-auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const goTo = (next: Step) => setSearchParams({ step: next }, { replace: true });

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    if (arr.includes(value)) setArr(arr.filter((x) => x !== value));
    else setArr([...arr, value]);
  };

  const submit = async () => {
    if (!user) return;
    if (!businessName.trim() || !postalCode || zones.length === 0 || specialties.length === 0) {
      toast({
        title: "Champs manquants",
        description: "Nom, code postal, au moins une zone et une spécialité sont requis.",
        variant: "destructive",
      });
      return;
    }
    if (siret && !/^\d{14}$/.test(siret)) {
      toast({
        title: "SIRET invalide",
        description: "Le SIRET doit comporter exactement 14 chiffres (ou être laissé vide).",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabaseMvpd.from("repairers").insert({
      user_id: user.id,
      name: businessName.trim(),
      address: address.trim() || "À renseigner",
      city: city.trim() || "À renseigner",
      postal_code: postalCode,
      phone: phone.trim() || null,
      email: user.email ?? null,
      bio: bio.trim() || null,
      siret: siret.trim() || null,
      service_zones: zones,
      specialties,
      services: specialties,
      qualirepar_certified: qualiCertified,
      qualirepar_categories: qualiCertified ? qualiCategories : [],
      status: "pending",
      source: "self_signup",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Création impossible", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Profil créé",
      description: "Votre fiche est en attente de validation par l'équipe TopRéparateurs.",
    });
    navigate("/pro/leads");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Onboarding réparateur — Espace pro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Devenir réparateur partenaire</h1>
        <p className="text-muted-foreground mb-6">4 étapes rapides pour recevoir vos premiers leads.</p>

        <nav className="flex gap-2 mb-8 flex-wrap">
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => goTo(s)}
              className={`px-3 py-1 rounded-full text-sm border ${
                s === step ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
            >
              {STEP_LABEL[s]}
            </button>
          ))}
        </nav>

        {step === "profil" && (
          <Card>
            <CardHeader>
              <CardTitle>{STEP_LABEL.profil}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Raison sociale *</Label>
                <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value.replace(/\D/g, "").slice(0, 14))}
                  pattern="\d{14}"
                  title="Le SIRET doit comporter exactement 14 chiffres"
                  inputMode="numeric"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    inputMode="numeric"
                    pattern="\d{5}"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="bio">Présentation</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>
              <Button onClick={() => goTo("zones")}>Suivant</Button>
            </CardContent>
          </Card>
        )}

        {step === "zones" && (
          <Card>
            <CardHeader>
              <CardTitle>{STEP_LABEL.zones}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Saisissez les codes postaux que vous desservez (séparés par espace, virgule ou point-virgule).
              </p>
              <Textarea
                value={zonesText}
                onChange={(e) => setZonesText(e.target.value)}
                placeholder="75001 75002 75003 92100 92110"
                rows={3}
              />
              <p className="text-sm">
                Zones reconnues : <strong>{zones.length}</strong>
                {zones.length > 0 && ` (${zones.slice(0, 8).join(", ")}${zones.length > 8 ? "…" : ""})`}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo("profil")}>Précédent</Button>
                <Button onClick={() => goTo("specialites")} disabled={zones.length === 0}>Suivant</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "specialites" && (
          <Card>
            <CardHeader>
              <CardTitle>{STEP_LABEL.specialites}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sélectionnez les appareils que vous savez réparer.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPECIALITY_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={specialties.includes(s)}
                      onCheckedChange={() => toggle(specialties, setSpecialties, s)}
                    />
                    <span className="capitalize">{s}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo("zones")}>Précédent</Button>
                <Button onClick={() => goTo("qualirepar")} disabled={specialties.length === 0}>Suivant</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "qualirepar" && (
          <Card>
            <CardHeader>
              <CardTitle>{STEP_LABEL.qualirepar}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={qualiCertified}
                  onCheckedChange={(c) => setQualiCertified(Boolean(c))}
                />
                <span>Je suis labellisé QualiRépar</span>
              </label>
              {qualiCertified && (
                <div className="pl-6 space-y-2">
                  <p className="text-sm text-muted-foreground">Catégories labellisées :</p>
                  {QUALIREPAR_CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={qualiCategories.includes(c)}
                        onCheckedChange={() => toggle(qualiCategories, setQualiCategories, c)}
                      />
                      <span className="capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo("specialites")}>Précédent</Button>
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Enregistrement…" : "Créer ma fiche"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OnboardingPage;
