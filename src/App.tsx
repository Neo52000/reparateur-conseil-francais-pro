import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from '@/components/search/SearchPage';
import AdminPage from '@/pages/AdminPage';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from '@tanstack/react-query';
import RepairersPage from '@/pages/RepairersPage';
import FeatureFlagsPage from '@/pages/FeatureFlagsPage';
import CatalogManagementPage from '@/pages/CatalogManagementPage';
import RepairerProfilePage from '@/pages/RepairerProfilePage';
import RepairWorkflowPage from '@/pages/RepairWorkflowPage';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/repairers" element={<RepairersPage />} />
            <Route path="/admin/features" element={<FeatureFlagsPage />} />
            <Route path="/admin/catalog" element={<CatalogManagementPage />} />
            <Route path="/repairer/:repairerId" element={<RepairerProfilePage />} />
            <Route path="/repair-workflow/:quoteId" element={<RepairWorkflowPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
