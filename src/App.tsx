import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

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

// Components
import LoadingSpinner from '@/components/ui/loading-spinner';

const App: React.FC = () => {
  const { setAuth, setLoading, loading } = useAuthStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error getting profile:', profileError);
        }

        setAuth(session, profile);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error getting profile:', profileError);
          }

          setAuth(session, profile);
        } else {
          setAuth(null, null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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