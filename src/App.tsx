
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import AdminFeaturesPage from '@/pages/AdminFeaturesPage';
import AdminCatalogPage from '@/pages/AdminCatalogPage';
import RepairersManagementPage from '@/pages/RepairersManagementPage';
import ClientAuth from '@/pages/ClientAuth';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import RepairerAuth from '@/pages/RepairerAuth';
import RepairerDashboardPage from '@/pages/RepairerDashboardPage';
import RepairerPlans from '@/pages/RepairerPlans';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/features" element={<AdminFeaturesPage />} />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/repairers" element={<RepairersManagementPage />} />
            <Route path="/client/auth" element={<ClientAuth />} />
            <Route path="/client" element={<ClientDashboardPage />} />
            <Route path="/repairer/auth" element={<RepairerAuth />} />
            <Route path="/repairer" element={<RepairerDashboardPage />} />
            <Route path="/repairer/plans" element={<RepairerPlans />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
