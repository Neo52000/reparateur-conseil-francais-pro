
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import NotificationSystem from './NotificationSystem';
import { User, Wrench, Shield } from 'lucide-react';

const Navigation = () => {
  const { user, isAdmin, signOut, profile, canAccessClient, canAccessRepairer, canAccessAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isClientPath = location.pathname.startsWith('/client');
  const isRepairerPath = location.pathname.startsWith('/repairer');
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              RepairHub
            </Link>
            
            {!isClientPath && !isRepairerPath && !isAdminPath && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Accueil
                </Link>
                <Link to="/quotes-appointments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Devis & RDV
                </Link>
              </div>
            )}

            {/* Navigation pour les utilisateurs connectés avec accès multiple */}
            {user && (canAccessClient || canAccessRepairer || canAccessAdmin) && (
              <div className="hidden md:flex space-x-4">
                {canAccessClient && (
                  <Link to="/client" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Client
                    {isAdmin && profile?.role === 'admin' && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">Test</span>
                    )}
                  </Link>
                )}
                
                {canAccessRepairer && (
                  <Link to="/repairer" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Wrench className="h-4 w-4 mr-1" />
                    Réparateur
                    {isAdmin && profile?.role === 'admin' && (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1 rounded">Test</span>
                    )}
                  </Link>
                )}

                {canAccessAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                )}

                <Link to="/quotes-appointments" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Devis & RDV
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <NotificationSystem />}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <span className="text-sm text-gray-700">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  {isAdmin && (
                    <div className="text-xs text-blue-600 font-medium">Administrateur</div>
                  )}
                </div>
                <Button onClick={handleSignOut} variant="outline">
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/client/auth">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <User className="h-4 w-4 mr-2" />
                    Client
                  </Button>
                </Link>
                <Link to="/repairer/auth">
                  <Button className="bg-orange-600 hover:bg-orange-700">
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
