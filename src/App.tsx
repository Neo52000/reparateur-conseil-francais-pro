import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStoreProvider } from "./components/GlobalStoreProvider";
import { AuthProvider } from "./hooks/useAuth";
import { PlanPreviewProvider } from "./hooks/usePlanPreview";
import ChatbotLayout from "./components/ChatbotLayout";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerProfilePage from "./pages/RepairerProfilePage";
import RepairerPlans from "./pages/RepairerPlans";
import RepairerTestimonials from "./pages/RepairerTestimonials";
import RepairerFAQ from "./pages/RepairerFAQ";
import SmartphoneRepairPage from "./pages/services/SmartphoneRepairPage";
import TabletRepairPage from "./pages/services/TabletRepairPage";
import ComputerRepairPage from "./pages/services/ComputerRepairPage";
import ConsoleRepairPage from "./pages/services/ConsoleRepairPage";
import LocalSeoPage from "./components/LocalSeoPage";
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
import TermsOfSale from "./pages/TermsOfSale";
import NotFound from "./pages/NotFound";
import { useVisitorTracker } from "./hooks/useVisitorTracker";
import { GlobalVisitorTracker } from "./components/GlobalVisitorTracker";
import StaticPagesManagerPage from "./pages/admin/StaticPagesManagerPage";
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
    <ChatbotLayout>
      <GlobalVisitorTracker />
      {import.meta.env.DEV && <RuntimeDiagnostics />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/static-pages" element={<StaticPagesManagerPage />} />
        <Route path="/reparateur-:serviceType-:city" element={<LocalSeoPage />} />
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
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/terms-of-sale" element={<TermsOfSale />} />
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ChatbotLayout>
  );
};

export default App;