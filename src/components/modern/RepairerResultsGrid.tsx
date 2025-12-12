import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RepairerCardEnhanced from '@/components/repairer/RepairerCardEnhanced';
import RepairerClaimModal from '@/components/repairer/RepairerClaimModal';
import RepairerProfileModal from '@/components/RepairerProfileModal';

interface Repairer {
  id: string;
  name: string;
  business_name?: string;
  address: string;
  city: string;
  postal_code?: string;
  phone: string;
  rating?: number;
  review_count?: number;
  lat?: number;
  lng?: number;
  is_verified?: boolean;
  has_qualirepar_label?: boolean;
  services?: string[];
  subscription_tier?: string;
  user_id?: string | null;
}

const RepairerResultsGrid = () => {
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [claimRepairer, setClaimRepairer] = useState<Repairer | null>(null);

  useEffect(() => {
    loadRepairers();
  }, []);

  const loadRepairers = async () => {
    try {
      // Charger les réparateurs avec leurs abonnements
      const { data, error } = await supabase
        .from('repairers')
        .select(`
          id, name, business_name, address, city, postal_code, phone, 
          lat, lng, rating, is_verified, has_qualirepar_label, services, user_id
        `)
        .eq('is_verified', true)
        .not('lat', 'is', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(9);

      if (error) throw error;
      
      if (data) {
        // Récupérer les abonnements pour ces réparateurs
        const repairerIds = data.map(r => r.id);
        const { data: subscriptions } = await supabase
          .from('repairer_subscriptions')
          .select('repairer_id, subscription_tier')
          .in('repairer_id', repairerIds)
          .eq('subscribed', true);

        const subscriptionMap = new Map(
          subscriptions?.map(s => [s.repairer_id, s.subscription_tier]) || []
        );

        // Fusionner les données
        const enrichedRepairers = data.map(r => ({
          ...r,
          subscription_tier: subscriptionMap.get(r.id) || 'free',
        }));

        // Trier: premium/enterprise d'abord, puis par rating
        enrichedRepairers.sort((a, b) => {
          const tierOrder = { enterprise: 0, premium: 1, free: 2 };
          const aTier = tierOrder[a.subscription_tier as keyof typeof tierOrder] ?? 2;
          const bTier = tierOrder[b.subscription_tier as keyof typeof tierOrder] ?? 2;
          if (aTier !== bTier) return aTier - bTier;
          return (b.rating || 0) - (a.rating || 0);
        });

        setRepairers(enrichedRepairers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réparateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading mb-4">
            Réparateurs disponibles
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez nos réparateurs certifiés près de chez vous
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {repairers.map((repairer) => (
                <RepairerCardEnhanced
                  key={repairer.id}
                  repairer={repairer as any}
                  onClick={() => setSelectedRepairerId(repairer.id)}
                  onClaim={() => setClaimRepairer(repairer)}
                />
              ))}
            </div>

            {repairers.length > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2"
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

      {/* Modal revendication */}
      {claimRepairer && (
        <RepairerClaimModal
          isOpen={!!claimRepairer}
          onClose={() => setClaimRepairer(null)}
          repairerName={claimRepairer.business_name || claimRepairer.name}
          repairerId={claimRepairer.id}
        />
      )}
    </section>
  );
};

export default RepairerResultsGrid;
