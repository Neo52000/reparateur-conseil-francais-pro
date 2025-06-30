
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import AdminFeaturesPage from '@/pages/AdminFeaturesPage';
import AdminCatalogPage from '@/pages/AdminCatalogPage';
import RepairersManagementPage from '@/pages/RepairersManagementPage';
import ClientAuth from '@/pages/ClientAuth';
import RepairerAuth from '@/pages/RepairerAuth';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import RepairerDashboardPage from '@/pages/RepairerDashboardPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiesPolicy from '@/pages/CookiesPolicy';
import { Toaster } from '@/components/ui/toaster';
import RepairWorkflowPage from '@/pages/RepairWorkflowPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/features" element={<AdminFeaturesPage />} />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/repairers" element={<RepairersManagementPage />} />
            <Route path="/client-auth" element={<ClientAuth />} />
            <Route path="/client" element={<ClientDashboardPage />} />
            <Route path="/repairer-auth" element={<RepairerAuth />} />
            <Route path="/repairer" element={<RepairerDashboardPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiesPolicy />} />
            <Route path="/repair-workflow/:quoteId" element={<RepairWorkflowPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
