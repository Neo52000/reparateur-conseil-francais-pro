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
    <section className="relative min-h-[60vh] flex items-center overflow-hidden">
      {/* Background Image avec overlay - using img tag for better LCP */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Réparateurs professionnels"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover blur-[3px] scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-white/70" />
      
      {/* Content */}
      <div className="container mx-auto px-6 lg:px-10 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-heading leading-tight">
            Trouvez votre réparateur
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comparateur gratuit de réparateurs de smartphones, tablettes et consoles
          </p>
          
          {/* Barre de recherche simplifiée */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex gap-3 bg-white rounded-lg shadow-lg p-2">
              {/* Input */}
              <Input
                type="text"
                placeholder="Trouvez votre réparateur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12 border-0 bg-white text-gray-900 focus-visible:ring-0"
              />
              
              {/* Bouton */}
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold whitespace-nowrap"
              >
                <Search className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Réparateur</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
