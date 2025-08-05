import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import RepairerDashboard from '@/pages/repairer/RepairerDashboard';
import SearchPage from '@/pages/SearchPage';
import RepairerProfilePage from '@/pages/RepairerProfilePage';
import QuotePage from '@/pages/QuotePage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/repairer/:id" element={<RepairerProfilePage />} />
          <Route path="/quote/:id" element={<QuotePage />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/repairer/*" element={<RepairerDashboard />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster richColors position="bottom-right" />
      </div>
    </Router>
  );
};

export default App;