import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const UsageWidget: React.FC = () => {
  const { permissions, usageStats, checkLimit, currentPlan, planNames } = usePermissions();

  const appointmentLimit = checkLimit('appointments');
  const professionalLimit = checkLimit('professionals');

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const appointmentPercentage = appointmentLimit.isUnlimited 
    ? 0 
    : Math.min((appointmentLimit.current / appointmentLimit.limit) * 100, 100);

  return (
    <Card className="card-elegant">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Uso do Plano</h3>
        <Badge variant="outline" className="bg-primary/10">
          {planNames[currentPlan as keyof typeof planNames]}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Appointments Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Agendamentos</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {appointmentLimit.isUnlimited 
                ? `${appointmentLimit.current} / Ilimitado`
                : `${appointmentLimit.current} / ${appointmentLimit.limit}`
              }
            </span>
          </div>
          {!appointmentLimit.isUnlimited && (
            <Progress 
              value={appointmentPercentage} 
              className={cn(
                "h-2",
                `[&>div]:${getProgressColor(appointmentPercentage)}`
              )}
            />
          )}
          {appointmentPercentage > 80 && !appointmentLimit.isUnlimited && (
            <p className="text-xs text-orange-600 mt-1">
              Atenção: Você está próximo do limite mensal
            </p>
          )}
        </div>

        {/* Professionals Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Profissionais</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {professionalLimit.isUnlimited 
                ? `${professionalLimit.current} / Ilimitado`
                : `${professionalLimit.current} / ${professionalLimit.limit}`
              }
            </span>
          </div>
          {!professionalLimit.allowed && !professionalLimit.isUnlimited && (
            <p className="text-xs text-red-600 mt-1">
              Limite atingido. Faça upgrade para adicionar mais profissionais.
            </p>
          )}
        </div>

        {/* Upgrade CTA */}
        {(currentPlan === 'conhecendo' || currentPlan === 'comecei_agora') && (
          <div className="pt-3 border-t border-border">
            <Button size="sm" className="w-full" variant="outline">
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};