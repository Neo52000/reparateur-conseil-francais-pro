
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ClientAuth from "./pages/ClientAuth";
import RepairerAuth from "./pages/RepairerAuth";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import RepairerDashboardPage from "./pages/RepairerDashboardPage";
import AdminPage from "./pages/AdminPage";
import AdminAuditPage from "./pages/AdminAuditPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import BlogRepairerPage from "./pages/BlogRepairerPage";
import RepairerPlans from "./pages/RepairerPlans";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/client-auth" element={<ClientAuth />} />
            <Route path="/repairer-auth" element={<RepairerAuth />} />
            <Route path="/client" element={<ClientDashboardPage />} />
            <Route path="/repairer" element={<RepairerDashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/article/:slug" element={<BlogArticlePage />} />
            <Route path="/blog/repairers" element={<BlogRepairerPage />} />
            <Route path="/blog/repairers/article/:slug" element={<BlogRepairerPage />} />
            <Route path="/repairer/plans" element={<RepairerPlans />} />
            <Route path="/contact" element={<Index />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
