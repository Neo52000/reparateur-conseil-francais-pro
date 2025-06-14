
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboard from '@/components/ClientDashboard';

const ClientDashboardPage = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/client/auth');
      return;
    }

    // Si l'utilisateur a un rôle mais n'est pas client
    if (profile?.role && profile.role !== 'client') {
      if (profile.role === 'repairer') {
        navigate('/repairer');
      } else if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      return;
    }
  }, [user, loading, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Chargement de votre espace client...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ClientDashboard />;
};

export default ClientDashboardPage;
