
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboard from '@/components/RepairerDashboard';

const RepairerSpace = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/repairer/auth', { replace: true }); // correction: redirige vers l'auth réparateur
    }
  }, [user, loading, navigate]);

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

  return <RepairerDashboard />;
};

export default RepairerSpace;
