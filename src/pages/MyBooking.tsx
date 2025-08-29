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
        <div className={cn(
          "flex items-center justify-center",
          isMobile ? "h-48" : "h-64"
        )}>
          <div className={cn(
            "border-2 border-primary border-t-transparent rounded-full animate-spin",
            isMobile ? "w-5 h-5" : "w-6 h-6"
          )}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={cn(
        "animate-fade-in min-h-screen",
        isMobile ? "space-y-3 pb-6" : "space-y-8 pb-8"
      )}>
        <MySpaceManager />
      </div>
    </DashboardLayout>
  );
};

export default MyBooking;