import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStoreProvider } from "./components/GlobalStoreProvider";
import { AuthProvider } from "./hooks/useAuth";
import { PlanPreviewProvider } from "./hooks/usePlanPreview";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerProfilePage from "./pages/RepairerProfilePage";
import RepairerPlans from "./pages/RepairerPlans";
import RepairerTestimonials from "./pages/RepairerTestimonials";
import RepairerFAQ from "./pages/RepairerFAQ";
import ServiceRepairPage from "./pages/services/ServiceRepairPage";
import LocalSeoPage from "./pages/LocalSeoPage";
import RepairerSettingsPage from "./pages/RepairerSettingsPage";
import RepairTrackingPage from "./pages/RepairTrackingPage";
import StaticPage from "./pages/StaticPage";
import RepairerAuthPage from "./pages/RepairerAuthPage";
import ClientAuthPage from "./pages/ClientAuthPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import { SuppliersDirectoryPage } from "./pages/SuppliersDirectoryPage";
import QuotesAndAppointments from "./pages/QuotesAndAppointments";
import { useVisitorTracker } from "./hooks/useVisitorTracker";
import { GlobalVisitorTracker } from "./components/GlobalVisitorTracker";
// Configuration production
import { initializeProductionMode, performProductionHealthCheck } from './config/productionSetup';
import { RuntimeDiagnostics } from "./components/dev/RuntimeDiagnostics";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
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
  );
};

const AppWithTracking = () => {
  return (
    <>
      <GlobalVisitorTracker />
      {import.meta.env.DEV && <RuntimeDiagnostics />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/repairer-dashboard" element={<RepairerDashboardPage />} />
        <Route path="/client-dashboard" element={<ClientDashboardPage />} />
        <Route path="/repairer-profile" element={<RepairerProfilePage />} />
        <Route path="/repairer-plans" element={<RepairerPlans />} />
        <Route path="/repairer-testimonials" element={<RepairerTestimonials />} />
        <Route path="/repairer-faq" element={<RepairerFAQ />} />
        <Route path="/services/repair" element={<ServiceRepairPage />} />
        <Route path="/local-seo" element={<LocalSeoPage />} />
        <Route path="/repairer-settings" element={<RepairerSettingsPage />} />
        <Route path="/repair-tracking" element={<RepairTrackingPage />} />
        <Route path="/static/:slug" element={<StaticPage />} />
        <Route path="/repairer-auth" element={<RepairerAuthPage />} />
        <Route path="/client-auth" element={<ClientAuthPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/suppliers-directory" element={<SuppliersDirectoryPage />} />
        <Route path="/quotes-appointments" element={<QuotesAndAppointments />} />
      </Routes>
    </>
  );
};

export default App;