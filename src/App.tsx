import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PartnerDashboard from "./pages/PartnerDashboard";
import QuotesAndAppointments from "./pages/QuotesAndAppointments";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import ClientSpace from "./pages/ClientSpace";
import RepairerSpace from "./pages/RepairerSpace";
import ClientAuth from "./pages/ClientAuth";
import RepairerAuth from "./pages/RepairerAuth";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Routes clients */}
          <Route path="/client/auth" element={<ClientAuth />} />
          <Route path="/client" element={<ClientDashboardPage />} />
          
          {/* Routes réparateurs */}
          <Route path="/repairer/auth" element={<RepairerAuth />} />
          <Route path="/repairer" element={<RepairerDashboardPage />} />
          
          {/* Routes communes */}
          <Route path="/quotes-appointments" element={<QuotesAndAppointments />} />
          
          {/* Routes anciennes (à supprimer plus tard) */}
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/client-space" element={<ClientSpace />} />
          <Route path="/repairer-space" element={<RepairerSpace />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
