import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'repairer' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, profile, isAdmin, canAccessRepairer, canAccessClient } = useAuth();

  // Attendre le chargement de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-muted-foreground">Vérification des droits d'accès...</span>
      </div>
    );
  }

  // Rediriger vers l'authentification si non connecté
  if (!user) {
    const authRoute = requiredRole === 'admin' ? '/admin-auth' : 
                     requiredRole === 'repairer' ? '/repairer-auth' : '/client-auth';
    return <Navigate to={authRoute} replace />;
  }

  // Vérifier les permissions selon le rôle requis
  if (requiredRole) {
    switch (requiredRole) {
      case 'admin':
        if (!isAdmin) {
          return <Navigate to="/admin-auth" replace />;
        }
        break;
      case 'repairer':
        if (!canAccessRepairer) {
          return <Navigate to="/repairer-auth" replace />;
        }
        break;
      case 'user':
        if (!canAccessClient) {
          return <Navigate to="/client-auth" replace />;
        }
        break;
    }
  }

  return <>{children}</>;
};