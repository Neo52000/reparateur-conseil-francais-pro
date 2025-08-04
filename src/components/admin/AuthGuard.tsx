import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthForm from '@/components/AdminAuthForm';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireRepairer?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Composant de protection pour vérifier l'authentification et les permissions
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAdmin = false, 
  requireRepairer = false,
  fallback 
}) => {
  const { user, profile, isAdmin, canAccessRepairer, loading } = useAuth();

  // Pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <AdminAuthForm />;
  }

  // Vérification des permissions admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions administrateur nécessaires pour accéder à cette section.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Profil actuel: {profile?.role || 'non défini'}</p>
              <p>Email: {profile?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérification des permissions réparateur
  if (requireRepairer && !canAccessRepairer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section réparateur.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Profil actuel: {profile?.role || 'non défini'}</p>
              <p>Email: {profile?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Utilisateur autorisé, afficher le contenu
  return <>{children}</>;
};