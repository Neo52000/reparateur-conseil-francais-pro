
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              RepairHub
            </Link>
            
            <div className="flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Accueil
              </Link>
              {user && (
                <Link to="/quotes-appointments" className="text-gray-700 hover:text-blue-600">
                  Devis & RDV
                </Link>
              )}
              {profile?.role === 'partner' && (
                <Link to="/partner-dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard Partenaire
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {profile?.first_name || user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
