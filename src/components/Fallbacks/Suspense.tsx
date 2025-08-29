import React, { Suspense } from 'react';
import LoadingState from '@/components/LoadingState';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
  className = ''
}) => {
  const defaultFallback = (
    <div className={`min-h-[200px] flex items-center justify-center ${className}`}>
      <LoadingState />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};