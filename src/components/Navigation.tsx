
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import NotificationSystem from './NotificationSystem';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import Logo from './Logo';
import { User, Wrench, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, isAdmin, signOut, profile, canAccessClient, canAccessRepairer, canAccessAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Initiating sign out from Navigation...');
      
      // Toujours effectuer la déconnexion et rediriger
      await signOut();
      
      console.log('✅ Sign out completed, redirecting to home...');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force redirect to home page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('💥 Exception during sign out:', error);
      
      // Même en cas d'erreur, rediriger vers l'accueil
      toast({
        title: "Déconnexion effectuée",
        description: "Vous avez été déconnecté"
      });
      
      navigate('/', { replace: true });
    }
  };

  const isClientPath = location.pathname.startsWith('/client');
  const isRepairerPath = location.pathname.startsWith('/repairer');
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <Logo variant="compact" size="xxl" />
            </Link>

            {/* Navigation générale */}
            <div className="hidden md:flex space-x-4">
              <Link to="/blog" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Blog
              </Link>
            </div>

            {/* Navigation pour les utilisateurs connectés avec accès multiple */}
            {user && (canAccessClient || canAccessRepairer || canAccessAdmin) && (
              <div className="hidden md:flex space-x-4">
                {canAccessClient && (
                  <Link to="/client" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Client
                    {isAdmin && (
                      <span className="ml-1 text-xs bg-primary/10 text-primary px-1 rounded">Test</span>
                    )}
                  </Link>
                )}
                
                {canAccessRepairer && (
                  <Link to="/repairer" className="text-foreground/80 hover:text-accent px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Wrench className="h-4 w-4 mr-1" />
                    Réparateur
                    {isAdmin && (
                      <span className="ml-1 text-xs bg-accent/10 text-accent px-1 rounded">Test</span>
                    )}
                  </Link>
                )}

                {canAccessAdmin && (
                  <Link to="/admin" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <OfflineIndicator />
            {user && <NotificationSystem />}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <span className="text-sm text-foreground/80">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  {isAdmin && (
                    <div className="text-xs text-primary font-medium">Administrateur</div>
                  )}
                </div>
                <Button onClick={handleSignOut} variant="outline">
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/client-auth">
                  <Button variant="soft">
                    <User className="h-4 w-4 mr-2" />
                    Client
                  </Button>
                </Link>
                <Link to="/repairer-auth">
                  <Button variant="soft">
                    <Wrench className="h-4 w-4 mr-2" />
                    Réparateur
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
