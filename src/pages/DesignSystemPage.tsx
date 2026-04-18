import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const colorTokens: { name: string; varName: string; usage: string }[] = [
  { name: 'Primary (Electric Blue)', varName: '--primary', usage: 'Actions principales, liens' },
  { name: 'Accent (Vibrant Orange)', varName: '--accent', usage: 'CTA secondaires, highlights' },
  { name: 'Success', varName: '--success', usage: 'Validations, confirmations' },
  { name: 'Warning', varName: '--warning', usage: 'Avertissements non bloquants' },
  { name: 'Destructive', varName: '--destructive', usage: 'Erreurs, suppression' },
  { name: 'Muted', varName: '--muted', usage: 'Arrière-plans neutres' },
  { name: 'Border', varName: '--border', usage: 'Séparateurs, contours' },
];

const surfaceTokens = [
  { name: 'Surface 0', varName: '--surface-0' },
  { name: 'Surface 1', varName: '--surface-1' },
  { name: 'Surface 2', varName: '--surface-2' },
  { name: 'Surface 3', varName: '--surface-3' },
];

const elevations = [
  { name: 'elev-1', className: 'shadow-elev-1' },
  { name: 'elev-2', className: 'shadow-elev-2' },
  { name: 'elev-3', className: 'shadow-elev-3' },
];

const spacings = [
  { name: 'space-1', value: '4px', className: 'w-1' },
  { name: 'space-2', value: '8px', className: 'w-2' },
  { name: 'space-3', value: '12px', className: 'w-3' },
  { name: 'space-4', value: '16px', className: 'w-4' },
  { name: 'space-6', value: '24px', className: 'w-6' },
  { name: 'space-8', value: '32px', className: 'w-8' },
  { name: 'space-12', value: '48px', className: 'w-12' },
  { name: 'space-16', value: '64px', className: 'w-16' },
];

const Swatch = ({ label, varName, usage }: { label: string; varName: string; usage?: string }) => (
  <div className="flex flex-col rounded-lg overflow-hidden border border-border bg-card shadow-elev-1">
    <div
      className="h-20"
      style={{ background: `hsl(var(${varName}))` }}
      aria-hidden
    />
    <div className="p-3">
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground font-mono">{varName}</div>
      {usage && <div className="text-xs text-muted-foreground mt-1">{usage}</div>}
    </div>
  </div>
);

const DesignSystemPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Design System — TopRéparateurs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Design System</h1>
          <p className="text-muted-foreground mt-2">
            Tokens de référence : couleurs, surfaces, élévations, typographie, espacements et composants.
          </p>
        </div>
      </header>

      <main className="container py-12 space-y-16">
        <section aria-labelledby="tokens-colors">
          <h2 id="tokens-colors" className="text-2xl font-serif font-bold mb-6">Couleurs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colorTokens.map(t => (
              <Swatch key={t.varName} label={t.name} varName={t.varName} usage={t.usage} />
            ))}
          </div>
        </section>

        <section aria-labelledby="tokens-surfaces">
          <h2 id="tokens-surfaces" className="text-2xl font-serif font-bold mb-6">Surfaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {surfaceTokens.map(t => (
              <Swatch key={t.varName} label={t.name} varName={t.varName} />
            ))}
          </div>
        </section>

        <section aria-labelledby="tokens-elevations">
          <h2 id="tokens-elevations" className="text-2xl font-serif font-bold mb-6">Élévations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {elevations.map(e => (
              <div
                key={e.name}
                className={`rounded-xl bg-card p-6 h-32 flex items-center justify-center ${e.className}`}
              >
                <span className="font-mono text-sm">{e.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tokens-typography">
          <h2 id="tokens-typography" className="text-2xl font-serif font-bold mb-6">Typographie</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h1>H1 — Titre principal</h1>
              <h2>H2 — Titre de section</h2>
              <h3>H3 — Sous-titre</h3>
              <p className="text-base">
                Corps (Inter, 16 px) — comparez gratuitement les réparateurs certifiés près de chez vous.
              </p>
              <p className="text-sm text-muted-foreground">
                Small (14 px, muted) — métadonnées, légendes, texte secondaire.
              </p>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="tokens-spacing">
          <h2 id="tokens-spacing" className="text-2xl font-serif font-bold mb-6">Espacements</h2>
          <div className="space-y-2">
            {spacings.map(s => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-28 text-sm font-mono">{s.name}</div>
                <div className={`h-3 rounded bg-primary ${s.className}`} />
                <div className="text-xs text-muted-foreground">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tokens-components">
          <h2 id="tokens-components" className="text-2xl font-serif font-bold mb-6">Composants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Boutons</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Primaire</Button>
                <Button variant="secondary">Secondaire</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DesignSystemPage;
