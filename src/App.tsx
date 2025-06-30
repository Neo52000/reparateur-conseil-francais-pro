
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '@/pages/Index';
import NewSearchPage from '@/pages/NewSearchPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import RepairerDashboardPage from '@/pages/RepairerDashboardPage';
import NotFound from '@/pages/NotFound';
import AdminPage from '@/pages/AdminPage';
import RepairersManagementPage from '@/pages/RepairersManagementPage';
import ScrapingControl from '@/components/ScrapingControl';
import AdminAuditMiddleware from '@/components/admin/AdminAuditMiddleware';
import AdminAuditPage from '@/pages/AdminAuditPage';
import AdminAuditDashboardPage from '@/pages/AdminAuditDashboardPage';
import AdminAuditAnalyticsPage from '@/pages/AdminAuditAnalyticsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuditMiddleware>
          <div className="min-h-screen bg-background">
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<NewSearchPage />} />
                <Route path="/client-dashboard" element={<ClientDashboardPage />} />
                <Route path="/repairer-dashboard" element={<RepairerDashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/repairers" element={<RepairersManagementPage />} />
                <Route path="/admin/scraping" element={<ScrapingControl />} />
                
                {/* Admin Audit Routes */}
                <Route path="/admin/audit" element={<AdminAuditPage />} />
                <Route path="/admin/audit/dashboard" element={<AdminAuditDashboardPage />} />
                <Route path="/admin/audit/analytics" element={<AdminAuditAnalyticsPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </AdminAuditMiddleware>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
