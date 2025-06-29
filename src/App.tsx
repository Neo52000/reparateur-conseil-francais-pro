
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import AdminPage from '@/pages/AdminPage';
import AdminFeaturesPage from '@/pages/AdminFeaturesPage';
import RepairersManagementPage from '@/pages/RepairersManagementPage';
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
            <Route path="/admin/repairers" element={<RepairersManagementPage />} />
            <Route path="/repair-workflow/:quoteId" element={<RepairWorkflowPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
