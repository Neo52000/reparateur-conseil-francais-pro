import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

interface BonusEntry {
  appareil: string;
  categorie: string;
  montant: number;
}

// Barème indicatif Bonus Réparation 2026 (montants fixés par décret).
// Mis à jour annuellement — source ADEME / ecosystem.eco.
const BONUS_TABLE: BonusEntry[] = [
  { appareil: "Lave-linge", categorie: "gros électroménager", montant: 25 },
  { appareil: "Lave-vaisselle", categorie: "gros électroménager", montant: 25 },
  { appareil: "Sèche-linge", categorie: "gros électroménager", montant: 25 },
  { appareil: "Réfrigérateur", categorie: "gros électroménager", montant: 30 },
  { appareil: "Four / micro-ondes", categorie: "gros électroménager", montant: 20 },
  { appareil: "Aspirateur", categorie: "petit électroménager", montant: 10 },
  { appareil: "Cafetière", categorie: "petit électroménager", montant: 10 },
  { appareil: "Smartphone", categorie: "informatique", montant: 25 },
  { appareil: "Tablette", categorie: "informatique", montant: 25 },
  { appareil: "Ordinateur portable", categorie: "informatique", montant: 50 },
  { appareil: "Téléviseur", categorie: "image et son", montant: 40 },
  { appareil: "Imprimante", categorie: "informatique", montant: 15 },
  { appareil: "Outillage électroportatif", categorie: "outillage", montant: 15 },
];

const BonusReparationPage = () => {
  const [selected, setSelected] = useState<string>("");

  const result = useMemo(
    () => BONUS_TABLE.find((b) => b.appareil === selected),
    [selected],
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Bonus Réparation : aide financière jusqu'à 50 € | TopRéparateurs</title>
        <meta
          name="description"
          content="Bonus Réparation 2026 : éligibilité, montants par appareil et démarches. Simulateur gratuit + mise en relation avec un réparateur labellisé QualiRépar."
        />
        <link rel="canonical" href="https://topreparateurs.fr/bonus-reparation" />
      </Helmet>
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Bonus Réparation</h1>
        <p className="text-muted-foreground mb-8">
          Une aide financière jusqu'à 50 € pour faire réparer vos appareils électroménagers,
          informatiques et électroniques, déduite directement de votre facture par un
          réparateur labellisé QualiRépar.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Simulateur d'éligibilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="appareil">Sélectionnez votre appareil</Label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger id="appareil">
                  <SelectValue placeholder="Ex : Smartphone" />
                </SelectTrigger>
                <SelectContent>
                  {BONUS_TABLE.map((b) => (
                    <SelectItem key={b.appareil} value={b.appareil}>
                      {b.appareil}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {result && (
              <div className="rounded-md border bg-muted/30 p-4 space-y-2">
                <p className="text-sm">
                  <Badge variant="secondary" className="mr-2">{result.categorie}</Badge>
                  {result.appareil}
                </p>
                <p className="text-2xl font-bold">
                  Aide indicative : <span className="text-primary">{result.montant} €</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Montant déduit directement de la facture par un réparateur QualiRépar.
                  Soumis à conditions (panne hors garantie, devis préalable). Barème ADEME 2026.
                </p>
              </div>
            )}

            <Button asChild>
              <Link to="/diagnostic">Trouver un réparateur QualiRépar →</Link>
            </Button>
          </CardContent>
        </Card>

        <section className="prose prose-sm max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-3">Comment ça marche ?</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Vous identifiez la panne (notre <Link className="underline" to="/diagnostic">diagnostic gratuit</Link> peut vous aider).</li>
            <li>Vous contactez un réparateur labellisé QualiRépar (filtré automatiquement par notre mise en relation).</li>
            <li>Le réparateur établit un devis incluant déjà la déduction du Bonus.</li>
            <li>Vous payez le montant net : la prise en charge est immédiate, sans formalité de votre part.</li>
          </ol>

          <h2 className="text-xl font-semibold mt-8 mb-3">Conditions principales</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Appareil utilisé en France, acheté en France ou dans l'UE.</li>
            <li>Panne hors garantie commerciale et hors garantie légale.</li>
            <li>Réparation effectuée par un professionnel labellisé QualiRépar.</li>
            <li>Bonus déduit sur la facture finale, dans la limite des montants fixés par le décret.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BonusReparationPage;
