
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboard from '@/components/RepairerDashboard';

const RepairerDashboardPage = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/repairer/auth');
      } else if (profile?.role === 'client') {
        navigate('/client');
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

  if (!user || profile?.role !== 'repairer') {
    return null;
  }

  return <RepairerDashboard />;
};

export default RepairerDashboardPage;
