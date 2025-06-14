
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboard from '@/components/ClientDashboard';

const ClientDashboardPage = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      console.log('ClientDashboardPage - User:', user?.id, 'Profile role:', profile?.role);
      
      if (!user) {
        console.log('No user, redirecting to client auth');
        navigate('/client/auth');
      } else if (profile && profile.role === 'repairer') {
        console.log('User is repairer, redirecting to repairer dashboard');
        navigate('/repairer');
      } else if (profile && profile.role !== 'client' && profile.role !== null) {
        console.log('User has invalid role for client space:', profile.role);
        navigate('/');
      }
    }
  }, [user, loading, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Si l'utilisateur est connecté mais n'a pas encore de profil ou a le bon rôle
  if (!profile || profile.role === 'client' || profile.role === null) {
    return <ClientDashboard />;
  }

  return null;
};

export default ClientDashboardPage;
