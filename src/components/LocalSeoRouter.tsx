import React from 'react';
import { useLocation } from 'react-router-dom';
import LocalSeoPage from './LocalSeoPage';

// Lazy load for modern variant
const ModernLocalSeoPage = React.lazy(() => import('../pages/ModernLocalSeoPage'));

/**
 * Router pour les pages SEO locales.
 * Gère les URLs de type /reparateur-smartphone-paris, /modern-reparateur-tablette-lyon, etc.
 * Utilise useLocation car React Router v6 ne supporte pas les wildcards partiels (ex: /prefix-*).
 */
const LocalSeoRouter: React.FC = () => {
  const { pathname } = useLocation();

  const isModern = pathname.startsWith('/modern-reparateur-');
  
  if (isModern) {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
        <ModernLocalSeoPage />
      </React.Suspense>
    );
  }

  return <LocalSeoPage />;
};

export default LocalSeoRouter;

/**
 * Vérifie si un pathname correspond à une page SEO locale.
 */
export function isLocalSeoPath(pathname: string): boolean {
  return /^\/(modern-)?reparateur-(smartphone|tablette|ordinateur)-.+/.test(pathname);
}
