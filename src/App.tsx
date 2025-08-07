import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

const App = () => {
  React.useEffect(() => {
    // Initialiser le mode production strict
    const prodConfig = initializeProductionMode();
    
    // Vérification de santé
    const healthCheck = performProductionHealthCheck();
    if (!healthCheck.healthy) {
      console.warn('⚠️ Problèmes détectés lors des vérifications de production');
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <GlobalStoreProvider>
              <PlanPreviewProvider>
                <TooltipProvider>
                  <AppWithTracking />
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </PlanPreviewProvider>
            </GlobalStoreProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

const AppWithTracking = () => {
  useVisitorTracker();
  
  return (
    <>
      <GlobalVisitorTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogArticlePage />} />
        <Route path="/blog/repairers" element={<BlogPage />} />
        <Route path="/blog/repairers/:slug" element={<BlogArticlePage />} />
        <Route path="/repairer-auth" element={<RepairerAuthPage />} />
        <Route path="/devenir-reparateur" element={<RepairerAuthPage />} />
        <Route path="/client-auth" element={<ClientAuthPage />} />
        <Route path="/repairer" element={<RepairerDashboardPage />} />
        <Route path="/repairer/plans" element={<RepairerPlans />} />
        <Route path="/repairer/temoignages" element={<RepairerTestimonials />} />
        <Route path="/repairer/faq" element={<RepairerFAQ />} />
        
            <Route path="/repairer/:id" element={<RepairerProfilePage />} />
            <Route path="/repairer/:id/:slug" element={<RepairerProfilePage />} />
        <Route path="/client" element={<ClientDashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/suppliers" element={<SuppliersDirectoryPage />} />
        <Route path="/reparation-:serviceType" element={<ServiceRepairPage />} />
        <Route path="/reparateur-:serviceType-:city" element={<LocalSeoPage />} />
        <Route path="/settings" element={<RepairerSettingsPage />} />
        <Route path="/paramètres" element={<RepairerSettingsPage />} />
        <Route path="/suivi/:orderId" element={<RepairTrackingPage />} />
        <Route path="/quotes-appointments" element={<QuotesAndAppointments />} />
        <Route path="/:slug" element={<StaticPage />} />
      </Routes>
    </>
  );
};

export default App;