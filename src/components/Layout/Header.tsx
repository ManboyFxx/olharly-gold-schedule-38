
import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Bell, User, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';

const Header = () => {
  const { user, signOut } = useAuth();
  const { currentPlan, planNames } = usePermissions();
  const { subscriptionEnd } = useSubscription();

  const getDaysRemaining = () => {
    if (!subscriptionEnd) return null;
    const endDate = new Date(subscriptionEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao sair da conta',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logout realizado',
        description: 'Você saiu da sua conta com sucesso',
      });
    }
  };

  return (
    <header className="bg-background border-b border-border shadow-soft">
      <div className="container-brand">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/images/OY.png" alt="Olharly Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Olharly</h1>
              <p className="text-xs text-muted-foreground">Agendamento Inteligente</p>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Plan Info */}
            {currentPlan && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gold-50 rounded-lg border border-gold-200">
                <Crown className="w-4 h-4 text-gold-600" />
                <div className="text-xs">
                  <p className="font-medium text-gold-800">{planNames[currentPlan] || 'Conhecendo'}</p>
                  {currentPlan === 'conhecendo' && (
                    <p className="text-gold-600">Trial Ativo</p>
                  )}
                  {daysRemaining && currentPlan !== 'conhecendo' && (
                    <p className="text-gold-600">{daysRemaining} dias restantes</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pl-3 border-l border-border">
              <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gold-700" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'Administrador'}</p>
                <p className="text-xs text-muted-foreground">Administrador(a)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
