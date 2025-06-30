import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LandingPage from '@/pages/LandingPage';
import RepairersPage from '@/pages/RepairersPage';
import ProfilePage from '@/pages/ProfilePage';
import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import PrivacyPage from '@/pages/PrivacyPage';
import CguPage from '@/pages/CguPage';
import NotFound from '@/pages/NotFound';
import AdminAuthPage from '@/pages/AdminAuthPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ClientInterestPage from '@/pages/ClientInterestPage';
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
                <Route path="/" element={<LandingPage />} />
                <Route path="/repairers" element={<RepairersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/cgu" element={<CguPage />} />
                <Route path="/admin/auth" element={<AdminAuthPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/scraping" element={<ScrapingControl />} />
                <Route path="/client-interest" element={<ClientInterestPage />} />
                
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
