
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <div className="card-elegant animate-scale-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className={`text-xs mt-2 ${changeColor}`}>{change}</p>
        </div>
        <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-gold-600" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
