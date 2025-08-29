import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import MySpaceManager from '@/components/Professionals/MySpaceManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MyBooking = () => {
  const isMobile = useIsMobile();

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