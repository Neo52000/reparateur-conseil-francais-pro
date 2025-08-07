import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/sections/HeroSection';
import SearchModeSelector from '@/components/search/SearchModeSelector';
import AdvancedProductSearch from '@/components/search/AdvancedProductSearch';
import MapWithFilters from '@/components/map/MapWithFilters';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '@/stores/searchStore';

const Index = () => {
  const navigate = useNavigate();
  const { searchMode, filters } = useSearchStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const handleQuickSearch = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleMapSearch = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleAdvancedSearch = useCallback(() => {
    setShowAdvancedSearch(true);
  }, []);

  // Affichage conditionnel selon l'état de recherche
  if (showAdvancedSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-blue via-electric-blue-dark to-vibrant-orange flex items-center justify-center p-4">
        <Helmet>
          <title>Recherche avancée - TopRéparateurs</title>
          <meta name="description" content="Recherche avancée de réparateurs par produit, marque et localisation" />
        </Helmet>
        <AdvancedProductSearch />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Helmet>
          <title>Résultats de recherche - TopRéparateurs</title>
          <meta name="description" content="Résultats de recherche pour votre réparation" />
        </Helmet>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Carte temporairement indisponible</h2>
          <p className="text-muted-foreground mb-4">Nous travaillons sur les résultats de recherche.</p>
          <button 
            onClick={() => setShowResults(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>TopRéparateurs - Trouvez le meilleur réparateur près de chez vous</title>
        <meta 
          name="description" 
          content="Trouvez rapidement un réparateur de confiance près de chez vous. Comparez les prix, consultez les avis et prenez rendez-vous en ligne." 
        />
        <meta name="keywords" content="réparateur, réparation, smartphone, tablette, ordinateur, dépannage" />
        <link rel="canonical" href="https://topreparateurs.fr" />
      </Helmet>

      {/* Hero Section avec recherche intégrée */}
      <HeroSection
        searchTerm={searchTerm}
        selectedLocation={selectedLocation}
        onSearchTermChange={setSearchTerm}
        onLocationChange={setSelectedLocation}
        onQuickSearch={handleQuickSearch}
      />

      {/* Mode de recherche alternatif en bas de page */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <SearchModeSelector
            onQuickSearch={handleQuickSearch}
            onMapSearch={handleMapSearch}
          />
          
          <div className="text-center mt-8">
            <button
              onClick={handleAdvancedSearch}
              className="text-primary hover:text-primary-dark underline font-medium"
            >
              Ou utilisez notre recherche avancée par produit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;