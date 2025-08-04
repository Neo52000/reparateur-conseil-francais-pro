import React from "react";
import { Helmet } from "react-helmet-async";

const TempSimpleIndex = () => {
  console.log('🔍 TempSimpleIndex - Composant ultra-simple monté');
  
  return (
    <>
      <Helmet>
        <title>Simple Debug Page - RepairHub</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            🔧 Page Ultra-Simple - Test Réussi
          </h1>
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg border">
            <p className="text-center text-muted-foreground">
              Cette page ultra-simple fonctionne sans aucune dépendance complexe !
            </p>
            <p className="text-center text-sm mt-4">
              Aucun hook d'authentification, aucune requête API, aucune logique métier.
            </p>
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm">
                ✅ React fonctionne
              </p>
              <p className="text-sm">
                ✅ Routing fonctionne  
              </p>
              <p className="text-sm">
                ✅ Styles fonctionnent
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TempSimpleIndex;