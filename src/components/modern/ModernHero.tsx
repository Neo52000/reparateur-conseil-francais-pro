import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-repair-workshop.jpg';

const ModernHero = () => {
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (city.trim()) {
      navigate(`/search?city=${encodeURIComponent(city)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden" aria-label="Recherche de réparateur">
      {/* Background Image avec overlay - using img tag for better LCP */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Atelier de réparation de smartphones et tablettes avec technicien professionnel"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover blur-[3px] scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-white/70" />
      
      {/* Content */}
      <div className="container mx-auto px-6 lg:px-10 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* H1 optimisé SEO : keyword "réparateur" en premier, < 60 chars */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading leading-tight">
            Trouvez le meilleur réparateur près de chez vous
          </h1>
          
          {/* Keyword dans les 100 premiers mots + value prop claire */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comparez gratuitement les <strong>réparateurs certifiés</strong> de smartphones, tablettes, ordinateurs et consoles dans votre ville. Devis gratuit, intervention rapide, garantie incluse.
          </p>
          
          {/* Barre de recherche avec label accessible */}
          <div className="max-w-2xl mx-auto mt-8">
            <label htmlFor="search-city" className="sr-only">Entrez votre ville pour trouver un réparateur</label>
            <div className="flex gap-3 bg-card rounded-lg shadow-lg p-2">
              <Input
                id="search-city"
                type="text"
                placeholder="Votre ville (ex: Paris, Lyon, Marseille...)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12 border-0 bg-card text-foreground focus-visible:ring-0"
                aria-label="Ville pour rechercher un réparateur"
              />
              
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold whitespace-nowrap"
                aria-label="Rechercher un réparateur"
              >
                <Search className="w-5 h-5 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Plus de <strong>2 000 réparateurs</strong> référencés partout en France
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
