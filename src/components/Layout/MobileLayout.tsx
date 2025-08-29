
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import BottomNavigation from './BottomNavigation';
import FloatingActionButton from './FloatingActionButton';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Main content with proper mobile spacing */}
      <main 
        className={cn(
          "w-full min-h-screen",
          isMobile ? "pb-20 safe-area-pb" : "pb-4"
        )}
      >
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile-only components */}
      {isMobile && (
        <>
          <BottomNavigation />
          <FloatingActionButton />
        </>
      )}
    </div>
  );
}

export default MobileLayout;
