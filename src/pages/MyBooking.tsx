import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import MySpaceManager from '@/components/Professionals/MySpaceManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';

const MyBooking = () => {
  const isMobile = useIsMobile();
  const { profile, loading } = useUserProfile();

  // Redirecionar profissionais para o calendário
  if (!loading && profile?.role === 'professional') {
    return <Navigate to="/professional-calendar" replace />;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-4" : "space-y-8"
      )}>
        <MySpaceManager />
      </div>
    </DashboardLayout>
  );
};

export default MyBooking;