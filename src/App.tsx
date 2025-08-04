import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import SafeAppProvider from "@/providers/SafeAppProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy loading des composants principaux
const SafeNavigation = lazy(() => import("@/components/safe/SafeNavigation"));
const SafeRepairersCarousel = lazy(() => import("@/components/safe/SafeRepairersCarousel"));
const DebugPanel = lazy(() => import("@/components/debug/DebugPanel"));

// Lazy loading des pages principales
const AdminDashboard = lazy(() => import("@/components/AdminDashboard"));
const AdminAuthForm = lazy(() => import("@/components/AdminAuthForm"));
const ClientAuthForm = lazy(() => import("@/components/ClientAuthForm"));
const RepairerAuthForm = lazy(() => import("@/components/RepairerAuthForm"));
const RepairerDashboard = lazy(() => import("@/components/repairer-dashboard/RepairerDashboard"));
const ClientDashboard = lazy(() => import("@/components/ClientDashboard"));

// Composant de fallback pour le loading
const LoadingFallback: React.FC<{ text?: string }> = ({ text = "Chargement..." }) => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-muted-foreground">{text}</span>
  </div>
);

// Version stabilisée avec Error Boundaries et Lazy Loading
const StabilizedIndex = () => {
  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback text="Chargement de la navigation..." />}>
          <SafeNavigation />
        </Suspense>
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
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Trouver un réparateur
                </button>
                <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
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
          <Suspense fallback={<LoadingFallback text="Chargement des réparateurs..." />}>
            <SafeRepairersCarousel />
          </Suspense>
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
      
      <Suspense fallback={null}>
        <DebugPanel />
      </Suspense>
    </div>
  );
};

const App = () => {
  return (
    <SafeAppProvider>
      <BrowserRouter>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<StabilizedIndex />} />
          
          {/* Routes d'authentification */}
          <Route path="/admin-auth" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback text="Chargement de l'authentification admin..." />}>
                <AdminAuthForm />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/client-auth" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback text="Chargement de l'authentification client..." />}>
                <ClientAuthForm />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/repairer-auth" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback text="Chargement de l'authentification réparateur..." />}>
                <RepairerAuthForm />
              </Suspense>
            </ErrorBoundary>
          } />
          
          {/* Routes protégées */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback text="Chargement du dashboard admin..." />}>
                  <AdminDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/repairer" element={
            <ProtectedRoute requiredRole="repairer">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback text="Chargement du dashboard réparateur..." />}>
                  <RepairerDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/client" element={
            <ProtectedRoute requiredRole="user">
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback text="Chargement du dashboard client..." />}>
                  <ClientDashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Fallback pour toutes les autres routes */}
          <Route path="*" element={<StabilizedIndex />} />
        </Routes>
        
        {/* Panel de debug global */}
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      </BrowserRouter>
    </SafeAppProvider>
  );
};

export default App;