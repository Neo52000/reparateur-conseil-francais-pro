
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboard from '@/components/ClientDashboard';

const ClientDashboardPage = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/client/auth');
      } else if (profile?.role === 'repairer') {
        navigate('/repairer');
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

  if (!user || profile?.role !== 'client') {
    return null;
  }

  return <ClientDashboard />;
};

export default ClientDashboardPage;
