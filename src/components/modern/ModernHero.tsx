import { useState } from 'react';
import { Search, MapPin, Sparkles, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-repair-workshop.jpg';

const ModernHero = () => {
  const [device, setDevice] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (device.trim()) params.set('q', device.trim());
    if (city.trim()) params.set('city', city.trim());
    const qs = params.toString();
    navigate(qs ? `/search?${qs}` : '/search');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section
      className="relative min-h-[62vh] flex items-center overflow-hidden"
      aria-label="Recherche de réparateur"
    >
      {/* Hero background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Atelier de réparation de smartphones et tablettes avec technicien professionnel"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Plus de 2 000 réparateurs certifiés en France
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
            Trouvez le meilleur{' '}
            <span className="text-primary">réparateur</span> près de chez vous
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comparez les <strong className="text-foreground">réparateurs certifiés</strong> de smartphones, tablettes,
            ordinateurs et consoles. Devis gratuit, intervention rapide, garantie incluse.
          </p>

          {/* Search card */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row gap-2 bg-card rounded-2xl shadow-elev-3 p-2 border border-border">
              <label htmlFor="hero-device" className="sr-only">
                Appareil ou panne
              </label>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  id="hero-device"
                  type="text"
                  placeholder="iPhone 13, écran cassé…"
                  value={device}
                  onChange={e => setDevice(e.target.value)}
                  onKeyDown={handleKey}
                  className="h-12 pl-9 border-0 bg-transparent focus-visible:ring-0"
                  aria-label="Appareil ou panne"
                />
              </div>

              <div className="h-px sm:h-auto sm:w-px bg-border" aria-hidden />

              <label htmlFor="hero-city" className="sr-only">
                Ville
              </label>
              <div className="relative sm:w-56">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  id="hero-city"
                  type="text"
                  placeholder="Paris, Lyon…"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onKeyDown={handleKey}
                  className="h-12 pl-9 border-0 bg-transparent focus-visible:ring-0"
                  aria-label="Ville"
                />
              </div>

              <Button
                onClick={handleSearch}
                className="h-12 px-6 rounded-xl font-semibold whitespace-nowrap"
                aria-label="Rechercher un réparateur"
              >
                <Search className="w-4 h-4 sm:mr-2" aria-hidden />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
            </div>

            {/* Secondary CTA */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
              <button
                onClick={() => navigate('/ai-search')}
                className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Essayez notre diagnostic IA gratuit
              </button>
            </div>
          </div>

          {/* Trust inline */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 text-vibrant-orange fill-vibrant-orange" aria-hidden />
              <strong className="text-foreground">4.8/5</strong> sur 12 000+ avis
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success-button" aria-hidden />
              Garantie 6 mois
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span>Devis gratuit en 24h</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
