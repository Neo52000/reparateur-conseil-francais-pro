import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerPlans from "./pages/RepairerPlans";
import ServiceRepairPage from "./pages/services/ServiceRepairPage";
import RepairerSettingsPage from "./pages/RepairerSettingsPage";
import RepairTrackingPage from "./pages/RepairTrackingPage";
import StaticPage from "./pages/StaticPage";
import { useVisitorTracker } from "./hooks/useVisitorTracker";
import { GlobalVisitorTracker } from "./components/GlobalVisitorTracker";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppWithTracking />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

const AppWithTracking = () => {
  // Hook de tracking des visiteurs
  useVisitorTracker();
  
  return (
    <>
      <GlobalVisitorTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/repairer" element={<RepairerDashboardPage />} />
        <Route path="/repairer/plans" element={<RepairerPlans />} />
        <Route path="/client" element={<ClientDashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/reparation-smartphone" element={<ServiceRepairPage />} />
        <Route path="/reparation-tablette" element={<ServiceRepairPage />} />
        <Route path="/reparation-ordinateur" element={<ServiceRepairPage />} />
        <Route path="/reparation-console" element={<ServiceRepairPage />} />
        <Route path="/reparation-smartphone-:city" element={<ServiceRepairPage />} />
        <Route path="/settings" element={<RepairerSettingsPage />} />
        <Route path="/paramètres" element={<RepairerSettingsPage />} />
        <Route path="/suivi/:orderId" element={<RepairTrackingPage />} />
        <Route path="/:slug" element={<StaticPage />} />
      </Routes>
    </>
  );
};

export default App;