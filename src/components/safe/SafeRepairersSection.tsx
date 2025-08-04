import React from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const SafeRepairersSection = () => {
  return (
    <ErrorBoundary fallback={
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nos Réparateurs</h2>
          <p className="text-gray-600">Section temporairement indisponible</p>
        </div>
      </div>
    }>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Réparateurs Recommandés</h2>
            <p className="text-gray-600 mt-4">
              Découvrez nos réparateurs de confiance près de chez vous
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <h3 className="font-semibold mb-2">Réparateur {i}</h3>
                <p className="text-gray-600 text-sm">Expert en réparation smartphone</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-yellow-500">★★★★★</span>
                  <button className="text-blue-600 text-sm hover:underline">
                    Voir profil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SafeRepairersSection;