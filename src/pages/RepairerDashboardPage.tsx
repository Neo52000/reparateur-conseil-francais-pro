
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboard from '@/components/RepairerDashboard';

const RepairerDashboardPage = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      console.log('RepairerDashboardPage - User:', user?.id, 'Profile role:', profile?.role);
      
      if (!user) {
        console.log('No user, redirecting to repairer auth');
        navigate('/repairer/auth');
      } else if (profile && profile.role === 'client') {
        console.log('User is client, redirecting to client dashboard');
        navigate('/client');
      } else if (profile && profile.role !== 'repairer' && profile.role !== null) {
        console.log('User has invalid role for repairer space:', profile.role);
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
  if (!profile || profile.role === 'repairer' || profile.role === null) {
    return <RepairerDashboard />;
  }

  return null;
};

export default RepairerDashboardPage;
