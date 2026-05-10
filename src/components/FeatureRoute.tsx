import React from 'react';
import { Navigate } from 'react-router-dom';
import { FEATURES, type FeatureFlag } from '@/config/features';

interface FeatureRouteProps {
  flag: FeatureFlag;
  /** Where to send users when the feature is disabled. */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Renders children only when the given feature flag is on.
 * When off, redirects to `redirectTo` (default: home `/`).
 */
export const FeatureRoute: React.FC<FeatureRouteProps> = ({
  flag,
  redirectTo = '/',
  children,
}) => {
  if (!FEATURES[flag]) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

export default FeatureRoute;