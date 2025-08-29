
import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Building2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Plans = () => {
  const { subscribed, subscriptionTier, subscriptionEnd, loading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const isMobile = useIsMobile();

  const plans = [
    {
      name: 'Conhecendo',
      price: 'Grátis',
      period: '3 dias',
      description: 'Experimente tudo',
      priceId: 'price_1S19HsK77DLQIVOKKQY9pcf5',
      features: [
        'Todas as funcionalidades',
        'Todos os recursos',
        'Notificações (email + SMS)',
        'Relatórios básicos',
        'Widget de agendamento',
      ],
      icon: Zap,
      popular: false,
      isTrial: true,
    },
    {
      name: 'Comecei Agora',
      price: 'R$ 19,90',
      period: '/mês',
      description: 'Ideal para começar',
      priceId: 'price_1S19XZK77DLQIVOKJA2aaQFt',
      features: [
        'Até 100 agendamentos/mês',
        '1 profissional',
        'Notificações por email',
        'Widget embutível',
        'Suporte padrão',
      ],
      icon: Crown,
      popular: true,
      isTrial: false,
    },
    {
      name: 'Posicionado(a)',
      price: 'R$ 49,90',
      period: '/mês',
      description: 'Tudo liberado para escalar',
      priceId: 'price_1S19YLK77DLQIVOKm4WxYeXj',
      features: [
        'Agendamentos ilimitados',
        'Múltiplos profissionais',
        'Email + SMS + WhatsApp',
        'Relatórios avançados',
        'Widget + domínio personalizado',
        'App PWA instalável',
        'Integração WhatsApp + API',
        'Suporte prioritário 24/7',
      ],
      icon: Building2,
      popular: false,
      isTrial: false,
    },
  ];

  const handlePlanSelect = (priceId: string, planName: string) => {
    if (priceId === 'price_1S19HsK77DLQIVOKKQY9pcf5') {
      // Handle trial activation (already automatic for new users)
      checkSubscription(); // Refresh subscription status
      return;
    }
    createCheckout(priceId, planName);
  };

  const formatSubscriptionEnd = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-scale-in">
            <div className="w-8 h-8 bg-primary rounded-lg mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-6 px-4" : "space-y-8"
      )}>
        {/* Header */}
        <div className="text-center">
          <h1 className={cn(
            "font-bold text-foreground mb-4",
            isMobile ? "text-2xl" : "text-display-lg"
          )}>
            Escolha seu Plano
          </h1>
          <p className={cn(
            "text-muted-foreground max-w-2xl mx-auto",
            isMobile ? "text-base" : "text-lg"
          )}>
            Selecione o plano que melhor se adapta às suas necessidades e comece a gerenciar seus agendamentos de forma profissional.
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscribed && (
          <Card className="card-elegant max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Plano Ativo</h3>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200">
                  {subscriptionTier}
                </Badge>
                {subscriptionEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renovação em: {formatSubscriptionEnd(subscriptionEnd)}
                  </p>
                )}
              </div>
              <Button 
                onClick={openCustomerPortal}
                variant="outline"
                className="mt-4"
                size={isMobile ? "sm" : "default"}
              >
                Gerenciar Assinatura
              </Button>
            </div>
          </Card>
        )}

        {/* Plans Grid */}
        <div className={cn(
          "grid gap-6 max-w-6xl mx-auto",
          isMobile ? "grid-cols-1" : "md:grid-cols-3"
        )}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscribed && subscriptionTier === plan.name;
            
            return (
              <Card key={plan.name} className={cn(
                "card-elegant relative",
                plan.popular && "ring-2 ring-primary",
                isCurrentPlan && "bg-green-50/50 border-green-200"
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  
                  <ul className="space-y-3 mb-6 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePlanSelect(plan.priceId, plan.name)}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan}
                    size={isMobile ? "sm" : "default"}
                  >
                    {isCurrentPlan 
                      ? 'Plano Atual' 
                      : plan.isTrial 
                        ? 'Iniciar Trial' 
                        : 'Assinar Plano'
                    }
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Dúvidas Frequentes
          </h2>
          <div className="space-y-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-sm text-muted-foreground">
                Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">
                Existe período de teste?
              </h4>
              <p className="text-sm text-muted-foreground">
                Oferecemos 14 dias grátis para você testar todas as funcionalidades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Plans;
