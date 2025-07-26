
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
import BlogPage from '@/pages/BlogPage';
import BlogArticlePage from '@/pages/BlogArticlePage';
import ClientAuth from '@/pages/ClientAuth';
import RepairerAuth from '@/pages/RepairerAuth';
import ClientSpace from '@/pages/ClientSpace';
import RepairerSpace from '@/pages/RepairerSpace';
import RepairerPlans from '@/pages/RepairerPlans';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiesPolicy from '@/pages/CookiesPolicy';
import LocalSeoPage from '@/components/LocalSeoPage';
import SeoSitemap from '@/components/seo/SeoSitemap';

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
                
                {/* Authentication Routes */}
                <Route path="/client-auth" element={<ClientAuth />} />
                <Route path="/repairer-auth" element={<RepairerAuth />} />
                
                {/* User Spaces */}
                <Route path="/client" element={<ClientSpace />} />
                <Route path="/repairer" element={<RepairerSpace />} />
                <Route path="/repairer/plans" element={<RepairerPlans />} />
                
                {/* Dashboard Routes (for compatibility) */}
                <Route path="/client-dashboard" element={<ClientDashboardPage />} />
                <Route path="/repairer-dashboard" element={<RepairerDashboardPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/repairers" element={<RepairersManagementPage />} />
                <Route path="/admin/scraping" element={<ScrapingControl />} />
                
                {/* Admin Audit Routes */}
                <Route path="/admin/audit" element={<AdminAuditPage />} />
                <Route path="/admin/audit/dashboard" element={<AdminAuditDashboardPage />} />
                <Route path="/admin/audit/analytics" element={<AdminAuditAnalyticsPage />} />
                
                {/* Blog Routes */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/article/:slug" element={<BlogArticlePage />} />
                
      {/* SEO Local Routes avec support des accents */}
      <Route path="/réparateur-:service-:city" element={<LocalSeoPage />} />
      <Route path="/reparateur-:service-:city" element={<LocalSeoPage />} />
      <Route path="/:slug" element={<LocalSeoPage />} />
      
      {/* Sitemap SEO */}
      <Route path="/sitemap-seo.xml" element={<SeoSitemap />} />
      
                {/* Legal Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                
                {/* Catch-all route for 404 */}
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
