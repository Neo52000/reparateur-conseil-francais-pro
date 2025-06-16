
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ClientAuth from "./pages/ClientAuth";
import RepairerAuth from "./pages/RepairerAuth";
import AdminPage from "./pages/AdminPage";
import AdminFeaturesPage from "./pages/AdminFeaturesPage";
import RepairersManagementPage from "./pages/RepairersManagementPage";
import ScrapingAIPage from "./pages/ScrapingAIPage";
import ClientSpace from "./pages/ClientSpace";
import RepairerSpace from "./pages/RepairerSpace";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import PartnerDashboard from "./pages/PartnerDashboard";
import QuotesAndAppointments from "./pages/QuotesAndAppointments";
import RepairerPlans from "./pages/RepairerPlans";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/client-auth" element={<ClientAuth />} />
          <Route path="/repairer/auth" element={<RepairerAuth />} />
          <Route path="/repairer/plans" element={<RepairerPlans />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/features" element={<AdminFeaturesPage />} />
          <Route path="/admin/repairers" element={<RepairersManagementPage />} />
          <Route path="/admin/scraping-ai" element={<ScrapingAIPage />} />
          <Route path="/client" element={<ClientSpace />} />
          <Route path="/repairer" element={<RepairerSpace />} />
          <Route path="/client-dashboard" element={<ClientDashboardPage />} />
          <Route path="/repairer/dashboard" element={<RepairerDashboardPage />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/quotes-appointments" element={<QuotesAndAppointments />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
