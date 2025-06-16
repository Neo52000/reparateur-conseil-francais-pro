
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScrapingResults } from '@/hooks/useScrapingResults';
import AuthenticationStatus from './AuthenticationStatus';
import ScrapingOperations from './ScrapingOperations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ScrapingResults = () => {
  const { user, session, isAdmin, profile, loading: authLoading } = useAuth();
  const { loadResults, results, loading: resultsLoading } = useScrapingResults();

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
    if (!authLoading && user && isAdmin) {
      console.log("[ScrapingResults] Loading results - auth OK");
      loadResults();
    }
  }, [authLoading, user, isAdmin, loadResults]);

  // Afficher le statut d'authentification si nécessaire
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="space-y-6">
        <AuthenticationStatus
          authLoading={authLoading}
          user={user}
          isAdmin={isAdmin}
          profile={profile}
        />
        
        {/* Messages d'aide selon le cas */}
        {!authLoading && (
          <div className="space-y-4">
            {!user && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connexion requise :</strong> Vous devez être connecté pour accéder aux résultats de scraping.
                  Utilisez le formulaire ci-dessus pour vous connecter avec vos identifiants administrateur.
                </AlertDescription>
              </Alert>
            )}
            
            {user && !isAdmin && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Permissions insuffisantes :</strong> Votre compte ({user.email}) n'a pas les droits administrateur requis.
                  Contactez un administrateur pour obtenir les permissions nécessaires.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicateur de statut admin */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Accès administrateur confirmé :</strong> Connecté en tant que {user.email} 
          {profile?.role && ` (${profile.role})`}
        </AlertDescription>
      </Alert>

      {/* Informations sur les résultats */}
      {!resultsLoading && results.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{results.length} résultat(s) trouvé(s)</strong> dans la base de données. 
            Vous pouvez les filtrer, modifier ou supprimer depuis cette interface.
          </AlertDescription>
        </Alert>
      )}

      {/* Interface principale */}
      <ScrapingOperations />
    </div>
  );
};

export default ScrapingResults;
