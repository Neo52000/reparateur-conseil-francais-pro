import React from 'react';
import { Helmet } from 'react-helmet-async';
import QualiReparWizard from '@/components/qualirepar/v2/QualiReparWizard';

const QualiReparPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Module QualiRépar v2 - Conforme API Officielle | iRepar</title>
        <meta name="description" content="Module QualiRépar v2 entièrement conforme à l'API officielle du Fonds Réparation. Processus en 3 étapes : métadonnées, upload documents, confirmation." />
      </Helmet>
      
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Module QualiRépar v2</h1>
          <p className="text-gray-600 mt-2">
            Interface conforme à l'API officielle du Fonds Réparation
          </p>
        </div>
        
        <QualiReparWizard />
      </div>
    </>
  );
};

export default QualiReparPage;