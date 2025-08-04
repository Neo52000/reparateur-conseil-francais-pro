import React from "react";
import { Helmet } from "react-helmet-async";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

const DebugIndex = () => {
  console.log('🔍 DebugIndex - Composant monté');
  
  const { user, loading } = useSimplifiedAuth();
  console.log('🔍 DebugIndex - Auth state:', { user: !!user, loading });
  
  React.useEffect(() => {
    console.log('🔍 DebugIndex - useEffect exécuté');
    return () => {
      console.log('🔍 DebugIndex - Cleanup');
    };
  }, []);

  console.log('🔍 DebugIndex - Avant le render');

  return (
    <>
      <Helmet>
        <title>Debug Page - RepairHub</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            🔧 Mode Debug - Page de Test
          </h1>
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg border">
            <p className="text-center text-muted-foreground">
              Si vous voyez cette page, le composant Index fonctionne !
            </p>
            <p className="text-center text-sm mt-4">
              Vérifiez la console pour les logs de débogage.
            </p>
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm">
                État d'auth: {loading ? 'Chargement...' : (user ? 'Connecté' : 'Non connecté')}
              </p>
            </div>
            <div className="mt-4 text-center">
              <a 
                href="/debug-original" 
                className="text-primary hover:underline"
              >
                Tester la page originale
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DebugIndex;