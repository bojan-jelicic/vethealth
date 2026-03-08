import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = ['admin', 'vet'] }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Pristup odbijen</h1>
          <p className="text-muted-foreground mb-4">
            Nemate ovlaštenja za pristup ovoj stranici.
          </p>
          <p className="text-sm text-muted-foreground">
            Kontaktirajte administratora za dodjelu pristupa.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
