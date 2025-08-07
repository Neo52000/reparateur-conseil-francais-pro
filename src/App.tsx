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
                <AppWithTracking />
                <Toaster />
                <Sonner />
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
      <Routes>
        <Route path="/" element={<div>Test React Fix Working</div>} />
        <Route path="/admin" element={<div>Admin Dashboard - Working</div>} />
      </Routes>
    </>
  );
};

export default App;