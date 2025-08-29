
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const isMobile = useIsMobile();
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <div className="card-elegant animate-scale-in">
      <div className={cn(
        "flex items-center justify-between",
        isMobile && "flex-col space-y-3 text-center"
      )}>
        <div className={cn(
          isMobile && "order-2"
        )}>
          <p className={cn(
            "font-medium text-muted-foreground",
            isMobile ? "text-xs" : "text-sm"
          )}>{title}</p>
          <p className={cn(
            "font-bold text-foreground mt-1",
            isMobile ? "text-xl" : "text-2xl"
          )}>{value}</p>
          <p className={cn(
            `mt-2 ${changeColor}`,
            isMobile ? "text-xs" : "text-xs"
          )}>{change}</p>
        </div>
        <div className={cn(
          "bg-gold-100 rounded-lg flex items-center justify-center",
          isMobile ? "w-10 h-10 order-1" : "w-12 h-12"
        )}>
          <Icon className={cn(
            "text-gold-600",
            isMobile ? "w-5 h-5" : "w-6 h-6"
          )} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
