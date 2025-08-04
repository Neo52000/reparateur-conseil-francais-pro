import React, { memo, useCallback, useMemo } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useSafePriorityRepairers } from '@/hooks/safe/useSafePriorityRepairers';

interface SafeRepairersCarouselProps {
  onViewProfile?: (repairer: any) => void;
  onCall?: (phone: string) => void;
}

const SafeRepairersCarousel: React.FC<SafeRepairersCarouselProps> = memo(({
  onViewProfile = () => {},
  onCall = () => {}
}) => {
  const { repairers, loading, error } = useSafePriorityRepairers(6);

  // Optimisation avec useCallback pour éviter les re-renders
  const handleViewProfile = useCallback((repairer: any) => {
    onViewProfile(repairer);
  }, [onViewProfile]);

  const handleCall = useCallback((phone: string) => {
    onCall(phone);
  }, [onCall]);

  // Memoisation des éléments de skeleton
  const skeletonElements = useMemo(() => 
    [1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )), []
  );

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {skeletonElements}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || repairers.length === 0) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Réparateurs Recommandés</h2>
          <p className="text-gray-600">Chargement des réparateurs en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Réparateurs Recommandés</h2>
            <p className="text-gray-600 mt-4">
              Découvrez nos réparateurs de confiance près de chez vous
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {repairers.map((repairer) => (
              <div key={repairer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {repairer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{repairer.name}</h3>
                    {repairer.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">{repairer.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">Expert en réparation smartphone</p>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewProfile(repairer)}
                    className="flex-1 text-blue-600 border border-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-50 transition-colors"
                  >
                    Voir profil
                  </button>
                  {repairer.phone && (
                    <button 
                      onClick={() => handleCall(repairer.phone!)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Appeler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
});

export default SafeRepairersCarousel;