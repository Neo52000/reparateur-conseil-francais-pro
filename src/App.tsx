import { useEffect, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStoreProvider } from "./components/GlobalStoreProvider";
import { AuthProvider } from "./hooks/useAuth";
import { PlanPreviewProvider } from "./hooks/usePlanPreview";
import ErrorBoundary from "./components/ErrorBoundary";
import ChatbotLayout from "./components/ChatbotLayout";
// Only Index is eagerly loaded for fast FCP
import Index from "./pages/Index";
import { isLocalSeoPath } from "./components/LocalSeoRouter";
// Configuration production
import { initializeProductionMode, performProductionHealthCheck } from './config/productionSetup';
import { initializeSentry } from './config/sentry';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { PWAUpdateBanner } from './components/pwa/PWAUpdateBanner';

// --- Lazy-loaded pages (code-split for smaller initial bundle) ---

// Search
const SearchPage = lazy(() => import("./components/search/SearchPage"));
const AISearchPage = lazy(() => import("./components/search/AISearchPage").then(m => ({ default: m.AISearchPage })));

// Admin
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminImportPage = lazy(() => import("./components/admin/AdminImportPage"));
const StaticPagesManagerPage = lazy(() => import("./pages/admin/StaticPagesManagerPage"));
const ProfileBuilderPage = lazy(() => import("./pages/admin/ProfileBuilderPage"));

// Repairer
const RepairerDashboardPage = lazy(() => import("./pages/RepairerDashboardPage"));
const RepairerProfilePage = lazy(() => import("./pages/RepairerProfilePage"));
const RepairerPublicProfilePage = lazy(() => import("./pages/RepairerPublicProfilePage"));
const RepairerPlans = lazy(() => import("./pages/RepairerPlans"));
const RepairerTestimonials = lazy(() => import("./pages/RepairerTestimonials"));
const RepairerFAQ = lazy(() => import("./pages/RepairerFAQ"));
const RepairerSettingsPage = lazy(() => import("./pages/RepairerSettingsPage"));
const RepairerAuthPage = lazy(() => import("./pages/RepairerAuthPage"));
const RepairerSeoPage = lazy(() => import("./pages/RepairerSeoPage"));
const RepairTrackingPage = lazy(() => import("./pages/RepairTrackingPage"));

// Client
const ClientDashboardPage = lazy(() => import("./pages/ClientDashboardPage"));
const ClientAuthPage = lazy(() => import("./pages/ClientAuthPage"));

// Services
const SmartphoneRepairPage = lazy(() => import("./pages/services/SmartphoneRepairPage"));
const TabletRepairPage = lazy(() => import("./pages/services/TabletRepairPage"));
const ComputerRepairPage = lazy(() => import("./pages/services/ComputerRepairPage"));
const ConsoleRepairPage = lazy(() => import("./pages/services/ConsoleRepairPage"));

// SEO
const LocalSeoPage = lazy(() => import("./components/LocalSeoPage"));
const LocalSeoRouter = lazy(() => import("./components/LocalSeoRouter"));
const ModelCityPageLazy = lazy(() => import("./components/seo/programmatic/ModelCityPage").then(m => ({ default: m.ModelCityPage })));
const HubCityPageLazy = lazy(() => import("./components/seo/programmatic/HubCityPage").then(m => ({ default: m.HubCityPage })));
const SymptomPageLazy = lazy(() => import("./components/seo/programmatic/SymptomPage").then(m => ({ default: m.SymptomPage })));

// Blog
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const BlogRepairerPage = lazy(() => import("./pages/BlogRepairerPage"));

// Legal
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const TermsOfSale = lazy(() => import("./pages/TermsOfSale"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const MyDataPage = lazy(() => import("./pages/MyDataPage"));

// Other pages
const StaticPage = lazy(() => import("./pages/StaticPage"));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage"));
const AProposPage = lazy(() => import("./pages/AProposPage"));
const GarantiePage = lazy(() => import("./pages/GarantiePage"));
const GuideChoixReparateurPage = lazy(() => import("./pages/GuideChoixReparateurPage"));
const SuppliersDirectoryPage = lazy(() => import("./pages/SuppliersDirectoryPage").then(m => ({ default: m.SuppliersDirectoryPage })));
const QuotesAndAppointments = lazy(() => import("./pages/QuotesAndAppointments"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystemPage"));

// Dev tools (only in development)
const RuntimeDiagnostics = lazy(() => import("./components/dev/RuntimeDiagnostics").then(m => ({ default: m.RuntimeDiagnostics })));

// Lazy visitor tracker
const GlobalVisitorTracker = lazy(() => import("./components/GlobalVisitorTracker").then(m => ({ default: m.GlobalVisitorTracker })));

// Catch-all component: renders LocalSeoRouter for SEO paths, NotFound otherwise
const LocalSeoCatchAll = () => {
  const pathname = window.location.pathname;
  if (isLocalSeoPath(pathname)) return <LocalSeoRouter />;
  return <NotFound />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — data stays fresh
      gcTime: 10 * 60 * 1000,         // 10 min — keep in cache after unmount
      refetchOnWindowFocus: false,     // avoid unnecessary refetches
      retry: 1,                        // single retry on failure
    },
  },
});

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
        console.warn('Production health check issues detected');
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
      <Suspense fallback={null}>
        <GlobalVisitorTracker />
      </Suspense>
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <RuntimeDiagnostics />
        </Suspense>
      )}
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
        <Route path="/admin/profile-builder" element={<ProfileBuilderPage />} />
        <Route path="/admin/profile-builder/new" element={<ProfileBuilderPage />} />
        <Route path="/admin/profile-builder/:templateId" element={<ProfileBuilderPage />} />
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
        {/* Marketplace */}
        <Route path="/marketplace" element={<MarketplacePage />} />
        {/* Institutional pages */}
        <Route path="/a-propos" element={<AProposPage />} />
        <Route path="/garantie" element={<GarantiePage />} />
        <Route path="/guide-choix-reparateur" element={<GuideChoixReparateurPage />} />
        {/* Internal design system reference */}
        <Route path="/design-system" element={<DesignSystemPage />} />
        {/* SEO local catch-all */}
        <Route path="*" element={<LocalSeoCatchAll />} />
        </Routes>
      </Suspense>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Banners */}
      <PWAInstallBanner />
      <PWAUpdateBanner />
    </ChatbotLayout>
  );
};

export default App;
