import { useState, useEffect } from 'react';
import { MapPin, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Repairer {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating?: number;
  lat?: number;
  lng?: number;
}

const RepairerResultsGrid = () => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepairers();
  }, []);

  const loadRepairers = async () => {
    try {
      const { data, error } = await supabase
        .from('repairers')
        .select('id, name, address, city, phone, lat, lng')
        .eq('is_verified', true)
        .limit(9);

      if (error) throw error;
      
      if (data) {
        setRepairers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réparateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading mb-4">
              Réparateurs recommandés
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading mb-4">
            Réparateurs recommandés
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez notre sélection de professionnels certifiés près de chez vous
          </p>
        </div>

        {/* Grid de cartes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repairers.map((repairer) => (
            <Card
              key={repairer.id}
              className="p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-xl border border-border bg-white"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-2 font-heading">
                      {repairer.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{repairer.city}</span>
                    </div>
                  </div>
                  
                  {repairer.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{repairer.rating}</span>
                    </div>
                  )}
                </div>

                {/* Adresse */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {repairer.address}
                </p>

                {/* CTA */}
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md"
                  onClick={() => window.open(`tel:${repairer.phone}`, '_self')}
                >
                  <Phone className="w-4 h-4" />
                  Appeler
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA pour voir plus */}
        {repairers.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
              onClick={() => window.location.href = '/search'}
            >
              Voir tous les réparateurs
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RepairerResultsGrid;
