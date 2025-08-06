import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRepairer?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireRepairer = false,
  redirectTo = '/auth'
}) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      console.log('ProtectedRoute: No user, redirecting to auth');
      navigate(redirectTo);
      return;
    }

    if (requireAdmin && profile?.role !== 'admin') {
      console.log('ProtectedRoute: Admin required but user is not admin');
      navigate('/');
      return;
    }

    if (requireRepairer && profile?.role !== 'repairer' && profile?.role !== 'admin') {
      console.log('ProtectedRoute: Repairer access required but user does not have access');
      navigate('/');
      return;
    }
  }, [user, profile, loading, requireAdmin, requireRepairer, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return null;
  }

  if (requireRepairer && profile?.role !== 'repairer' && profile?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;