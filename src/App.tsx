import { useEffect, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStoreProvider } from "./components/GlobalStoreProvider";
import { AuthProvider } from "./hooks/useAuth";
import { PlanPreviewProvider } from "./hooks/usePlanPreview";
import ErrorBoundary from "./components/ErrorBoundary";
import ChatbotLayout from "./components/ChatbotLayout";
import Index from "./pages/Index";
import SearchPage from "./components/search/SearchPage";
import { AISearchPage } from "./components/search/AISearchPage";
import AdminPage from "./pages/AdminPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerProfilePage from "./pages/RepairerProfilePage";
import RepairerPublicProfilePage from "./pages/RepairerPublicProfilePage";
import RepairerPlans from "./pages/RepairerPlans";
import RepairerTestimonials from "./pages/RepairerTestimonials";
import RepairerFAQ from "./pages/RepairerFAQ";
import SmartphoneRepairPage from "./pages/services/SmartphoneRepairPage";
import TabletRepairPage from "./pages/services/TabletRepairPage";
import ComputerRepairPage from "./pages/services/ComputerRepairPage";
import ConsoleRepairPage from "./pages/services/ConsoleRepairPage";
import LocalSeoPage from "./components/LocalSeoPage";
import LocalSeoRouter from "./components/LocalSeoRouter";
import RepairerSeoPage from "./pages/RepairerSeoPage";
import DocumentationPage from "./pages/DocumentationPage";

import RepairerSettingsPage from "./pages/RepairerSettingsPage";
import RepairTrackingPage from "./pages/RepairTrackingPage";
import StaticPage from "./pages/StaticPage";
import RepairerAuthPage from "./pages/RepairerAuthPage";
import ClientAuthPage from "./pages/ClientAuthPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import BlogRepairerPage from "./pages/BlogRepairerPage";
import { SuppliersDirectoryPage } from "./pages/SuppliersDirectoryPage";
import QuotesAndAppointments from "./pages/QuotesAndAppointments";
import LegalNotice from "./pages/LegalNotice";
import TermsOfService from "./pages/TermsOfService";
import CookiesPolicy from "./pages/CookiesPolicy";
import TermsOfSale from "./pages/TermsOfSale";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MyDataPage from "./pages/MyDataPage";
import NotFound from "./pages/NotFound";
import { useVisitorTracker } from "./hooks/useVisitorTracker";
import { GlobalVisitorTracker } from "./components/GlobalVisitorTracker";
import StaticPagesManagerPage from "./pages/admin/StaticPagesManagerPage";
import AdminImportPage from "./components/admin/AdminImportPage";
// Configuration production
import { initializeProductionMode, performProductionHealthCheck } from './config/productionSetup';
import { RuntimeDiagnostics } from "./components/dev/RuntimeDiagnostics";
import { initializeSentry } from './config/sentry';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

const ModernLocalSeoPageLazy = lazy(() => import("./pages/ModernLocalSeoPage"));
const ModelCityPageLazy = lazy(() => import("./components/seo/programmatic/ModelCityPage").then(m => ({ default: m.ModelCityPage })));
const HubCityPageLazy = lazy(() => import("./components/seo/programmatic/HubCityPage").then(m => ({ default: m.HubCityPage })));
const SymptomPageLazy = lazy(() => import("./components/seo/programmatic/SymptomPage").then(m => ({ default: m.SymptomPage })));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialiser Sentry en premier
    initializeSentry();
    
    if (import.meta.env.PROD) {
      // Initialiser le mode production strict
      const prodConfig = initializeProductionMode();
      
      // Vérification de santé
      const healthCheck = performProductionHealthCheck();
      if (!healthCheck.healthy) {
        console.warn('⚠️ Problèmes détectés lors des vérifications de production');
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <GlobalStoreProvider>
                <PlanPreviewProvider>
                  <AppWithTracking />
                </PlanPreviewProvider>
              </GlobalStoreProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

const AppWithTracking = () => {
  return (
    <ChatbotLayout>
      <GlobalVisitorTracker />
      {import.meta.env.DEV && <RuntimeDiagnostics />}
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
        <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/ai-search" element={<AISearchPage />} />
        {/* Navigation routes */}
        <Route path="/reparateur" element={<Navigate to="/repairer-auth" replace />} />
        <Route path="/reparations" element={<Navigate to="/reparation-smartphone" replace />} />
        <Route path="/particuliers" element={<Navigate to="/client-auth" replace />} />
        <Route path="/login" element={<Navigate to="/client-auth" replace />} />
        <Route path="/connexion" element={<Navigate to="/client-auth" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/import" element={<AdminImportPage />} />
        <Route path="/admin/import/*" element={<AdminImportPage />} />
        <Route path="/admin/static-pages" element={<StaticPagesManagerPage />} />
        {/* SEO pages dynamiques - LocalSeoRouter gère le parsing de l'URL */}
        <Route path="/reparateur-smartphone-*" element={<LocalSeoRouter />} />
        <Route path="/reparateur-tablette-*" element={<LocalSeoRouter />} />
        <Route path="/reparateur-ordinateur-*" element={<LocalSeoRouter />} />
        <Route path="/modern-reparateur-smartphone-*" element={<ModernLocalSeoPageLazy />} />
        <Route path="/modern-reparateur-tablette-*" element={<ModernLocalSeoPageLazy />} />
        <Route path="/modern-reparateur-ordinateur-*" element={<ModernLocalSeoPageLazy />} />
        {/* Pages SEO programmatiques V3 */}
        <Route path="/reparation/:model/:city" element={<ModelCityPageLazy />} />
        <Route path="/reparateurs/:city" element={<HubCityPageLazy />} />
        <Route path="/probleme/:symptom" element={<SymptomPageLazy />} />
        {/* Pages SEO individuelles des réparateurs */}
        <Route path="/reparateur/:city/:repairerSlug" element={<RepairerPublicProfilePage />} />
        <Route path="/:city/:repairerName" element={<RepairerSeoPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/repairer-dashboard" element={<RepairerDashboardPage />} />
        <Route path="/client-dashboard" element={<ClientDashboardPage />} />
        <Route path="/repairer-profile" element={<RepairerProfilePage />} />
        <Route path="/repairer-plans" element={<RepairerPlans />} />
        <Route path="/repairer-testimonials" element={<RepairerTestimonials />} />
        <Route path="/repairer-faq" element={<RepairerFAQ />} />
        <Route path="/reparation-smartphone" element={<SmartphoneRepairPage />} />
        <Route path="/reparation-tablette" element={<TabletRepairPage />} />
        <Route path="/reparation-ordinateur" element={<ComputerRepairPage />} />
        <Route path="/reparation-console" element={<ConsoleRepairPage />} />
        <Route path="/local-seo" element={<LocalSeoPage />} />
        <Route path="/repairer-settings" element={<RepairerSettingsPage />} />
        <Route path="/repair-tracking" element={<RepairTrackingPage />} />
        <Route path="/static/:slug" element={<StaticPage />} />
        <Route path="/repairer-auth" element={<RepairerAuthPage />} />
        <Route path="/client-auth" element={<ClientAuthPage />} />
        {/* Aliases to avoid blank pages */}
        <Route path="/client" element={<Navigate to="/client-auth" replace />} />
        <Route path="/repairer" element={<Navigate to="/repairer-auth" replace />} />
        <Route path="/devenir-reparateur" element={<Navigate to="/repairer-plans" replace />} />
        {/* Blog */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/blog/article/:slug" element={<BlogArticlePage />} />
        <Route path="/blog/repairers" element={<BlogRepairerPage />} />
        <Route path="/blog/repairers/article/:slug" element={<BlogArticlePage />} />
        {/* Suppliers & quotes */}
        <Route path="/suppliers-directory" element={<SuppliersDirectoryPage />} />
        <Route path="/quotes-appointments" element={<QuotesAndAppointments />} />
        {/* Legal pages */}
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/mentions-legales" element={<Navigate to="/legal-notice" replace />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/conditions-generales" element={<Navigate to="/terms" replace />} />
        <Route path="/terms-of-sale" element={<TermsOfSale />} />
        <Route path="/cgv" element={<Navigate to="/terms-of-sale" replace />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/politique-confidentialite" element={<Navigate to="/privacy" replace />} />
        <Route path="/confidentialite" element={<Navigate to="/privacy" replace />} />
        <Route path="/cookies" element={<CookiesPolicy />} />
        <Route path="/mes-donnees" element={<MyDataPage />} />
        {/* Documentation */}
        <Route path="/documentation" element={<DocumentationPage />} />
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </ChatbotLayout>
  );
};

export default App;