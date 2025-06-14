
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  );
};

export default AuthPage;
