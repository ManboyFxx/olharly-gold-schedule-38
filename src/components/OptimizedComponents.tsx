import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Memoized button component for performance
export const OptimizedButton = memo(Button);

// Memoized card components
export const OptimizedCard = memo(Card);
export const OptimizedCardHeader = memo(CardHeader);
export const OptimizedCardContent = memo(CardContent);
export const OptimizedCardTitle = memo(CardTitle);
export const OptimizedCardDescription = memo(CardDescription);

// Memoized badge component
export const OptimizedBadge = memo(Badge);

// Display name assignments for debugging
OptimizedButton.displayName = 'OptimizedButton';
OptimizedCard.displayName = 'OptimizedCard';
OptimizedCardHeader.displayName = 'OptimizedCardHeader';
OptimizedCardContent.displayName = 'OptimizedCardContent';
OptimizedCardTitle.displayName = 'OptimizedCardTitle';
OptimizedCardDescription.displayName = 'OptimizedCardDescription';
OptimizedBadge.displayName = 'OptimizedBadge';