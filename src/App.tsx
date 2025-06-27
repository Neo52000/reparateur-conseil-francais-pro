
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import AdminPage from './pages/AdminPage';
import AdminCatalogPage from './pages/AdminCatalogPage';
import AdminFeaturesPage from './pages/AdminFeaturesPage';
import RepairersManagementPage from './pages/RepairersManagementPage';
import NewSearchPage from './pages/NewSearchPage';
import RepairerAuth from './pages/RepairerAuth';
import RepairerSpace from './pages/RepairerSpace';
import RepairerDashboardPage from './pages/RepairerDashboardPage';
import RepairerPlans from './pages/RepairerPlans';
import ClientSpace from './pages/ClientSpace';
import ClientDashboardPage from './pages/ClientDashboardPage';
import QuotesAndAppointments from './pages/QuotesAndAppointments';
import AuthPage from './pages/AuthPage';
import PartnerDashboard from './pages/PartnerDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import ClientAuth from './pages/ClientAuth';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/features" element={<AdminFeaturesPage />} />
            <Route path="/admin/repairers" element={<RepairersManagementPage />} />
            <Route path="/search" element={<NewSearchPage />} />
            <Route path="/repairer-auth" element={<RepairerAuth />} />
            <Route path="/repairer" element={<RepairerSpace />} />
            <Route path="/repairer/dashboard" element={<RepairerDashboardPage />} />
            <Route path="/repairer/plans" element={<RepairerPlans />} />
            <Route path="/client-auth" element={<ClientAuth />} />
            <Route path="/client" element={<ClientSpace />} />
            <Route path="/client/dashboard" element={<ClientDashboardPage />} />
            <Route path="/quotes" element={<QuotesAndAppointments />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/partner" element={<PartnerDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;
