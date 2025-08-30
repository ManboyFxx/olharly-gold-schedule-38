import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('super_admin' | 'organization_admin' | 'professional' | 'client')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isProfessional, isOwner } = useUserProfile();
  const location = useLocation();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-scale-in">
          <div className="w-8 h-8 bg-primary rounded-lg mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-scale-in">
          <div className="w-8 h-8 bg-destructive rounded-lg mx-auto mb-4"></div>
          <p className="text-muted-foreground">Erro ao carregar perfil do usuário</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário tem permissão para acessar a rota
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirecionar profissionais para sua página específica
    if (isProfessional) {
      return <Navigate to="/professional-calendar" replace />;
    }
    // Redirecionar donos para o dashboard
    if (isOwner) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  // Redirecionar profissionais que tentam acessar páginas administrativas
  const adminRoutes = ['/dashboard', '/clients', '/services', '/settings', '/reports', '/plans'];
  if (isProfessional && adminRoutes.some(route => location.pathname.startsWith(route))) {
    return <Navigate to="/professional-calendar" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;