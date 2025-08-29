import React from 'react';
import { usePermissions, type PlanPermissions } from '@/hooks/usePermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Crown, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: keyof PlanPermissions;
  limitType?: 'appointments' | 'professionals';
  fallback?: React.ReactNode;
  showUpgradeModal?: boolean;
  feature: string;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  limitType,
  fallback,
  showUpgradeModal = false,
  feature,
}) => {
  const { checkPermission, checkLimit, currentPlan, planNames } = usePermissions();
  const { createCheckout } = useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);

  // Check permission if provided
  const hasPermission = permission ? checkPermission(permission as keyof PlanPermissions) : true;
  
  // Check limit if provided
  const limitCheck = limitType ? checkLimit(limitType) : { allowed: true, current: 0, limit: 0, isUnlimited: true };

  const allowed = hasPermission && limitCheck.allowed;

  const handleUpgrade = async (planName: string) => {
    const priceIds = {
      'comecei_agora': 'price_1S19XZK77DLQIVOKJA2aaQFt',
      'posicionado': 'price_1S19YLK77DLQIVOKm4WxYeXj',
    };
    
    const priceId = priceIds[planName as keyof typeof priceIds];
    if (priceId) {
      await createCheckout(priceId, planName);
    }
    setUpgradeModalOpen(false);
  };

  if (allowed) {
    return <>{children}</>;
  }

  // Show upgrade modal when blocked
  const renderUpgradeModal = () => (
    <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Upgrade Necessário
          </DialogTitle>
          <DialogDescription>
            Para usar {feature}, você precisa fazer upgrade do seu plano.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Plano atual: <Badge variant="outline">{planNames[currentPlan as keyof typeof planNames]}</Badge>
            </p>
            {limitType && !limitCheck.isUnlimited && (
              <p className="text-sm text-muted-foreground mt-2">
                Uso atual: {limitCheck.current} / {limitCheck.limit} {limitType === 'appointments' ? 'agendamentos' : 'profissionais'}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            {currentPlan === 'conhecendo' && (
              <>
                <Button 
                  onClick={() => handleUpgrade('comecei_agora')}
                  className="w-full"
                  variant="outline"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Comecei Agora - R$ 19,90/mês
                </Button>
                <Button 
                  onClick={() => handleUpgrade('posicionado')}
                  className="w-full"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Posicionado(a) - R$ 49,90/mês
                </Button>
              </>
            )}
            
            {currentPlan === 'comecei_agora' && (
              <Button 
                onClick={() => handleUpgrade('posicionado')}
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade para Posicionado(a) - R$ 49,90/mês
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Render fallback or blocked UI
  if (fallback) {
    return (
      <>
        {fallback}
        {renderUpgradeModal()}
      </>
    );
  }

  return (
    <>
      <Card className={cn(
        "p-6 border-2 border-dashed border-muted-foreground/30",
        "bg-muted/20 text-center"
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              {feature} Indisponível
            </h3>
            <p className="text-sm text-muted-foreground">
              {permission 
                ? `Esta funcionalidade não está disponível no plano ${planNames[currentPlan as keyof typeof planNames]}.`
                : `Você atingiu o limite de ${limitType === 'appointments' ? 'agendamentos' : 'profissionais'} do seu plano.`
              }
            </p>
            {limitType && !limitCheck.isUnlimited && (
              <p className="text-xs text-muted-foreground">
                Uso atual: {limitCheck.current} / {limitCheck.limit}
              </p>
            )}
          </div>

          <Button 
            onClick={() => setUpgradeModalOpen(true)}
            size="sm"
            className="mt-4"
          >
            <Crown className="w-4 h-4 mr-2" />
            Fazer Upgrade
          </Button>
        </div>
      </Card>
      {renderUpgradeModal()}
    </>
  );
};