import { useState, useEffect } from 'react';
import { Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import RepairerProfileModal from '@/components/RepairerProfileModal';

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
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);

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

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mb-4">
            Réparateurs disponibles
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez nos réparateurs certifiés près de chez vous
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full mt-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {repairers.map((repairer) => (
                <Card 
                  key={repairer.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 rounded-xl bg-white border-gray-200 cursor-pointer"
                  onClick={() => setSelectedRepairerId(repairer.id)}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="w-20 h-20 rounded-lg">
                      <AvatarImage src="/placeholder-repairer.jpg" alt={repairer.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg rounded-lg font-semibold">
                        {repairer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                        {repairer.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {repairer.address}, {repairer.city}
                      </p>

                      {/* Boutons d'action */}
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRepairerId(repairer.id);
                          }}
                          variant="outline"
                          className="flex-1 gap-2"
                          size="sm"
                        >
                          <User className="w-4 h-4" />
                          Voir
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${repairer.phone}`, '_self');
                          }}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                          size="sm"
                        >
                          <Phone className="w-4 h-4" />
                          Appeler
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA */}
            {repairers.length > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => window.location.href = '/search'}
                >
                  Voir tous les réparateurs
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal profil réparateur */}
      <RepairerProfileModal
        repairerId={selectedRepairerId || ''}
        isOpen={!!selectedRepairerId}
        onClose={() => setSelectedRepairerId(null)}
      />
    </section>
  );
};

export default RepairerResultsGrid;
