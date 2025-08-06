import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import QuotesAppointmentsPage from '@/pages/QuotesAppointmentsPage';
import AuthPage from '@/pages/AuthPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import RepairerDashboardPage from '@/pages/RepairerDashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import './index.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="quotes-appointments" element={<QuotesAppointmentsPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="repairer-dashboard" element={<RepairerDashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;