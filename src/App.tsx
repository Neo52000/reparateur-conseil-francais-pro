import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStoreProvider } from "./components/GlobalStoreProvider";
import { AuthProvider } from "./hooks/useAuth";
import { SimplifiedAuthProvider } from "./hooks/useSimplifiedAuth";
import { PlanPreviewProvider } from "./hooks/usePlanPreview";
import TempSimpleIndex from "./pages/TempSimpleIndex";
import DebugIndex from "./pages/DebugIndex";
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
import DebugErrorBoundary from "./components/DebugErrorBoundary";
// Configuration production
import { initializeProductionMode, performProductionHealthCheck } from './config/productionSetup';

const queryClient = new QueryClient();

const App = () => {
  console.log('🔍 App - Composant principal monté');
  
  useEffect(() => {
    console.log('🔍 App - useEffect démarré');
    try {
      // TEMPORAIRE: Simplifier l'initialisation pour débugger
      console.log('🚀 Application démarrée en mode débogage');
      
      // Désactiver temporairement les vérifications de santé
      // const prodConfig = initializeProductionMode();
      // const healthCheck = performProductionHealthCheck();
      
      console.log('✅ Initialisation simplifiée réussie');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }, []);

  return (
    <DebugErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
        <GlobalStoreProvider>
          <SimplifiedAuthProvider>
            <PlanPreviewProvider>
                {/* TEMPORAIRE: Désactiver TooltipProvider qui cause l'erreur useState null */}
                {/* <TooltipProvider> */}
                  {/* TEMPORAIRE: Désactiver Toaster et Sonner qui peuvent causer des problèmes */}
                  {/* <Toaster /> */}
                  {/* <Sonner /> */}
                  <BrowserRouter>
                  <AppWithTracking />
                  </BrowserRouter>
                {/* </TooltipProvider> */}
            </PlanPreviewProvider>
          </SimplifiedAuthProvider>
        </GlobalStoreProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </DebugErrorBoundary>
  );
};

const AppWithTracking = () => {
  console.log('🔍 AppWithTracking - Composant monté');
  
  // TEMPORAIRE: Désactiver le tracking pour débugger
  // useVisitorTracker();
  
  console.log('🔍 AppWithTracking - Avant le return');
  
  return (
    <>
      {/* TEMPORAIRE: Désactiver GlobalVisitorTracker pour débugger */}
      {/* <GlobalVisitorTracker /> */}
      <Routes>
        <Route path="/" element={
          <>
            {console.log('🔍 Route / - Element rendu avec TempSimpleIndex')}
            <TempSimpleIndex />
          </>
        } />
        <Route path="/debug-original" element={<DebugIndex />} />
        <Route path="/blog" element={<BlogPage />} />
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