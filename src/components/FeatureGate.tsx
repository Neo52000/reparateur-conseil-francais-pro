import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isModuleEnabled, type BuildFlagKey } from '@/lib/buildFlags';

interface FeatureGateProps {
  flag: BuildFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Renders `children` only when the given build-time feature flag is enabled.
 * - In a route element, pass `redirectTo` (e.g. "/404") to navigate away.
 * - In an inline UI position, pass a `fallback` (or omit to render nothing).
 */
export function FeatureGate({ flag, children, fallback = null, redirectTo }: FeatureGateProps) {
  if (isModuleEnabled(flag)) return <>{children}</>;
  if (redirectTo) return <Navigate to={redirectTo} replace />;
  return <>{fallback}</>;
}
