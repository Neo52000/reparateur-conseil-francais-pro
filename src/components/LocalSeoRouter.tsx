import React from 'react';
import LocalSeoPage from './LocalSeoPage';

/**
 * Router wrapper pour les pages SEO locales.
 * Passe directement à LocalSeoPage qui gère le parsing de l'URL.
 */
const LocalSeoRouter: React.FC = () => {
  // LocalSeoPage gère déjà le parsing de l'URL via window.location.pathname
  return <LocalSeoPage />;
};

export default LocalSeoRouter;
