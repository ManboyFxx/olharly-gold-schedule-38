import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ResponsiveHeader from './ResponsiveHeader';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import FloatingActionButton from './FloatingActionButton';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleMenuToggle = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ResponsiveHeader onMenuToggle={handleMenuToggle} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 flex-shrink-0">
            <Sidebar />
          </aside>
        )}
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 overflow-auto",
            isMobile ? "pb-20" : "pb-4",
            className
          )}
        >
          <div className="max-w-screen-xl mx-auto p-4">
            {children}
          </div>
        </main>
      </div>
      
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

export default AppLayout;