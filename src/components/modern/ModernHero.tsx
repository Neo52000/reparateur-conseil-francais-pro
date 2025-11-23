import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

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
    <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 z-0" />
      
      {/* Content */}
      <div className="container mx-auto px-6 lg:px-10 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Titre */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
            Trouvez le meilleur réparateur près de chez vous
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Comparateur gratuit de réparateurs de smartphones, tablettes et consoles
          </p>
          
          {/* Glassmorphism Search Bar */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="glass backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Input Ville */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Ville, code postal..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 rounded-xl text-lg"
                  />
                </div>
                
                {/* Bouton Recherche */}
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Rechercher</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </section>
  );
};

export default ModernHero;
