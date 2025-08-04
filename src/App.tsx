import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import SafeNavigation from "@/components/safe/SafeNavigation";
import SafeRepairersCarousel from "@/components/safe/SafeRepairersCarousel";
import SafeAppProvider from "@/providers/SafeAppProvider";
import DebugPanel from "@/components/debug/DebugPanel";

// Version stabilisée avec Error Boundaries
const StabilizedIndex = () => {
  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <SafeNavigation />
      </ErrorBoundary>
      
      <main>
        <ErrorBoundary fallback={
          <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-bold mb-4">RepairHub</h1>
              <p className="text-xl">Plateforme de mise en relation avec des réparateurs</p>
            </div>
          </div>
        }>
          <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-5xl font-bold mb-6">RepairHub</h1>
              <p className="text-xl mb-8">
                Trouvez le réparateur de smartphone idéal près de chez vous
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
                  Trouver un réparateur
                </button>
                <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600">
                  Devenir réparateur
                </button>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        <ErrorBoundary fallback={
          <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nos Réparateurs</h2>
              <p className="text-gray-600">Section temporairement indisponible</p>
            </div>
          </div>
        }>
          <SafeRepairersCarousel />
        </ErrorBoundary>

        <ErrorBoundary fallback={
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Nos Services</h2>
            </div>
          </div>
        }>
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Comment ça marche ?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trouvez un réparateur</h3>
                  <p className="text-gray-600">Recherchez un professionnel près de chez vous</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Demandez un devis</h3>
                  <p className="text-gray-600">Obtenez des devis gratuits et transparents</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Prenez rendez-vous</h3>
                  <p className="text-gray-600">Réservez un créneau en quelques clics</p>
                </div>
              </div>
            </div>
          </section>
        </ErrorBoundary>
      </main>
      
      <ErrorBoundary fallback={
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2024 RepairHub. Tous droits réservés.</p>
          </div>
        </footer>
      }>
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">RepairHub</h3>
              <p className="text-gray-400">&copy; 2024 RepairHub. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </ErrorBoundary>
      
      <DebugPanel />
    </div>
  );
};

const App = () => {
  return (
    <SafeAppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StabilizedIndex />} />
          <Route path="*" element={<StabilizedIndex />} />
        </Routes>
      </BrowserRouter>
    </SafeAppProvider>
  );
};

export default App;