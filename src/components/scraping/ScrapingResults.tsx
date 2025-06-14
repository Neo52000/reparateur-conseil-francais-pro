
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScrapingResults } from '@/hooks/useScrapingResults';
import AuthenticationStatus from './AuthenticationStatus';
import ScrapingOperations from './ScrapingOperations';

const ScrapingResults = () => {
  const { user, session, isAdmin, profile, loading: authLoading } = useAuth();
  const { loadResults } = useScrapingResults();

  // Debug les informations d'authentification
  useEffect(() => {
    console.log("[ScrapingResults] Auth state:", { 
      user: !!user, 
      session: !!session, 
      isAdmin,
      profile: profile ? { role: profile.role, email: profile.email } : null,
      authLoading 
    });
  }, [user, session, isAdmin, profile, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      loadResults();
    }
  }, [authLoading, loadResults]);

  // Show authentication status or the main interface
  if (authLoading || !user || !isAdmin) {
    return (
      <AuthenticationStatus
        authLoading={authLoading}
        user={user}
        isAdmin={isAdmin}
        profile={profile}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AuthenticationStatus
        authLoading={authLoading}
        user={user}
        isAdmin={isAdmin}
        profile={profile}
      />
      <ScrapingOperations />
    </div>
  );
};

export default ScrapingResults;
