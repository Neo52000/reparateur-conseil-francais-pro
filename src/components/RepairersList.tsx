import React, { memo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRepairersOptimized } from '@/hooks/useRepairersOptimized';
import RepairerProfileModal from './RepairerProfileModal';
import RepairerCard from './repairers/RepairerCard';
import type { SearchFilters as SearchFiltersType } from '@/types/searchFilters';

interface RepairersListProps {
  compact?: boolean;
  filters?: SearchFiltersType;
}

// Threshold : on virtualise au-delà — sur les petites listes le DOM natif suffit.
const VIRTUAL_THRESHOLD = 30;
const ESTIMATED_CARD_HEIGHT = 220;
const VIRTUAL_VIEWPORT_HEIGHT = 1200;

const RepairersList = memo<RepairersListProps>(({ compact = false, filters }) => {
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const { repairers, loading, error } = useRepairersOptimized(filters);

  const handleViewProfile = (repairer: { id: string }) => {
    setSelectedRepairerId(repairer.id);
    setIsProfileModalOpen(true);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedRepairerId(null);
  };

  const shouldVirtualize = !compact && repairers.length > VIRTUAL_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? repairers.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 4,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Database className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Erreur de connexion à la base de données
          </h3>
          <p className="text-destructive mb-2">Impossible de charger les réparateurs</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (repairers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun réparateur trouvé
          </h3>
          <p className="text-muted-foreground mb-2">
            Aucun réparateur ne correspond aux critères actuels.
          </p>
          <p className="text-sm text-muted-foreground">
            Élargissez votre zone de recherche ou réinitialisez les filtres.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (shouldVirtualize) {
    return (
      <>
        <div
          ref={parentRef}
          className="overflow-y-auto pr-2"
          style={{ height: `${VIRTUAL_VIEWPORT_HEIGHT}px` }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const repairer = repairers[virtualRow.index];
              return (
                <div
                  key={repairer.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: '1rem',
                  }}
                >
                  <RepairerCard
                    repairer={repairer}
                    onViewProfile={handleViewProfile}
                    onCall={handleCall}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {selectedRepairerId && (
          <RepairerProfileModal
            isOpen={isProfileModalOpen}
            onClose={handleCloseProfileModal}
            repairerId={selectedRepairerId}
          />
        )}
      </>
    );
  }

  // Liste courte : rendu natif (pas de virtualisation, pas de scroll interne)
  return (
    <>
      <div className="space-y-4">
        {repairers.map((repairer) => (
          <RepairerCard
            key={repairer.id}
            repairer={repairer}
            onViewProfile={handleViewProfile}
            onCall={handleCall}
          />
        ))}
      </div>

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfileModal}
          repairerId={selectedRepairerId}
        />
      )}
    </>
  );
});

RepairersList.displayName = 'RepairersList';

export default RepairersList;
