import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import AdminFeaturesPage from '@/pages/AdminFeaturesPage';
import AdminCatalogPage from '@/pages/AdminCatalogPage';
import RepairersManagementPage from '@/pages/RepairersManagementPage';
import { ToastProvider } from '@/hooks/use-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/features" element={<AdminFeaturesPage />} />
              <Route path="/admin/catalog" element={<AdminCatalogPage />} />
              <Route path="/admin/repairers" element={<RepairersManagementPage />} />
            </Routes>
          </ToastProvider>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
