import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth';
import { useVisitorTracker } from './hooks/useVisitorTracker';
import { GlobalVisitorTracker } from './components/GlobalVisitorTracker';
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import RepairerSettingsPage from "./pages/RepairerSettingsPage";
import RepairTrackingPage from "./pages/RepairTrackingPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerPlans from "./pages/RepairerPlans";
import ServiceRepairPage from "./pages/services/ServiceRepairPage";

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
        <Route path="/aide" element={<div className="container mx-auto py-8"><h1>Centre d'aide</h1><p>Page en construction...</p></div>} />
        <Route path="/contact" element={<div className="container mx-auto py-8"><h1>Contact</h1><p>Page en construction...</p></div>} />
        <Route path="/faq" element={<div className="container mx-auto py-8"><h1>FAQ</h1><p>Page en construction...</p></div>} />
        <Route path="/mentions-legales" element={<div className="container mx-auto py-8"><h1>Mentions légales</h1><p>Page en construction...</p></div>} />
        <Route path="/politique-confidentialite" element={<div className="container mx-auto py-8"><h1>Politique de confidentialité</h1><p>Page en construction...</p></div>} />
        <Route path="/cgu" element={<div className="container mx-auto py-8"><h1>Conditions Générales d'Utilisation</h1><p>Page en construction...</p></div>} />
        <Route path="/cgv" element={<div className="container mx-auto py-8"><h1>Conditions Générales de Vente</h1><p>Page en construction...</p></div>} />
        <Route path="/settings" element={<RepairerSettingsPage />} />
        <Route path="/paramètres" element={<RepairerSettingsPage />} />
        <Route path="/suivi/:orderId" element={<RepairTrackingPage />} />
      </Routes>
    </>
  );
};

export default App;