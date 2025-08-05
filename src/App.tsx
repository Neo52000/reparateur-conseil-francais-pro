import './react-global';
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GlobalStoreProvider } from "./components/GlobalStoreProvider";
import { SimpleAuthProvider } from "./hooks/useSimpleAuth";
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
import SimpleRepairerAuth from "./pages/SimpleRepairerAuth";
import SimpleClientAuth from "./pages/SimpleClientAuth";
import SimpleClientDashboard from "./pages/SimpleClientDashboard";
import SimpleAdminPage from "./pages/SimpleAdminPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import { SuppliersDirectoryPage } from "./pages/SuppliersDirectoryPage";
import QuotesAndAppointments from "./pages/QuotesAndAppointments";
import { useVisitorTracker } from "./hooks/useVisitorTracker";
import { GlobalVisitorTracker } from "./components/GlobalVisitorTracker";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SimpleAuthProvider>
          <PlanPreviewProvider>
            <GlobalStoreProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <AppWithTracking />
                </BrowserRouter>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </GlobalStoreProvider>
          </PlanPreviewProvider>
        </SimpleAuthProvider>
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
        <Route path="/repairer-auth" element={<SimpleRepairerAuth />} />
        <Route path="/devenir-reparateur" element={<SimpleRepairerAuth />} />
        <Route path="/client-auth" element={<SimpleClientAuth />} />
        <Route path="/repairer" element={<RepairerDashboardPage />} />
        <Route path="/repairer/plans" element={<RepairerPlans />} />
        <Route path="/repairer/temoignages" element={<RepairerTestimonials />} />
        <Route path="/repairer/faq" element={<RepairerFAQ />} />
        
            <Route path="/repairer/:id" element={<RepairerProfilePage />} />
            <Route path="/repairer/:id/:slug" element={<RepairerProfilePage />} />
        <Route path="/client" element={<ClientDashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<SimpleAdminPage />} />
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