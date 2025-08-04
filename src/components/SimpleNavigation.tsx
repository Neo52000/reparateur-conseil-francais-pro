import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSimpleAuth';
import { User, Wrench, Shield } from 'lucide-react';

const SimpleNavigation = () => {
  const { user, isAdmin, signOut, profile, canAccessClient, canAccessRepairer, canAccessAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Initiating sign out...');
      await signOut();
      console.log('✅ Sign out completed');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Sign out error:', error);
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              RepairHub
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Navigation pour les utilisateurs connectés */}
                {canAccessClient && (
                  <Link 
                    to="/client" 
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Client
                  </Link>
                )}
                
                {canAccessRepairer && (
                  <Link 
                    to="/repairer" 
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Réparateur
                  </Link>
                )}
                
                {canAccessAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                )}

                <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
                  <span className="text-sm text-gray-600">
                    {profile?.first_name || 'Utilisateur'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                  >
                    Déconnexion
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Navigation pour les utilisateurs non connectés */}
                <Link 
                  to="/admin" 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Administration
                </Link>
                <Link 
                  to="/repairer-auth" 
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Réparateur
                </Link>
                <Link 
                  to="/client-auth" 
                  className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
                >
                  Client
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SimpleNavigation;