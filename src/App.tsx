import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { SimpleAuthProvider as AuthProvider } from '@/hooks/useSimpleAuth';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

// Pages
import HomePage from '@/pages/SimpleIndex';
import ClientAuthPage from '@/pages/ClientAuthPage';
import RepairerAuthPage from '@/pages/RepairerAuthPage';
import AdminPage from '@/pages/AdminPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import RepairerDashboardPage from '@/pages/RepairerDashboardPage';
import BlogPage from '@/pages/BlogPage';
// import BlogPostPage from '@/pages/BlogPostPage';
import LocalSeoPage from '@/components/LocalSeoPage';

// Lazy loading for performance
import { Suspense } from 'react';

// Global styles and error boundary
import './index.css';

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Page d'accueil */}
                  <Route path="/" element={<HomePage />} />
                  
                  {/* Authentification */}
                  <Route path="/client-auth" element={<ClientAuthPage />} />
                  <Route path="/repairer-auth" element={<RepairerAuthPage />} />
                  
                  {/* Tableaux de bord */}
                  <Route path="/client/*" element={<ClientDashboardPage />} />
                  <Route path="/repairer/*" element={<RepairerDashboardPage />} />
                  <Route path="/admin/*" element={<AdminPage />} />
                  
                  {/* Blog */}
                  <Route path="/blog" element={<BlogPage />} />
                  {/* <Route path="/blog/:slug" element={<BlogPostPage />} /> */}
                  
                  {/* Pages SEO locales */}
                  <Route path="/reparateur-:service-:city" element={<LocalSeoPage />} />
                  <Route path="/:service/:city/:slug" element={<LocalSeoPage />} />
                  
                  {/* Redirections et 404 */}
                  <Route path="/dashboard" element={<Navigate to="/client" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              
              {/* Toast notifications */}
              <Toaster />
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;