import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Crown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

const ResponsiveHeader = ({ onMenuToggle }: ResponsiveHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { currentPlan, planNames } = usePermissions();
  const { subscriptionEnd } = useSubscription();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isProfessional = profile?.role === 'professional';
  const isAdmin = profile?.role === 'organization_admin' || profile?.role === 'super_admin';

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

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  // Navegação para profissionais
  const professionalNavigation = [
    {
      name: 'Meu Calendário',
      href: '/professional-calendar',
    },
  ];

  // Navegação para administradores
  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
    },
    {
      name: 'Calendário',
      href: '/calendar',
    },
    {
      name: 'Meu espaço',
      href: '/my-booking',
    },
    {
      name: 'Serviços',
      href: '/services',
    },
    {
      name: 'Clientes',
      href: '/clients',
    },
    {
      name: 'Relatórios',
      href: '/reports',
    },
    {
      name: 'Planos',
      href: '/plans',
    },
    {
      name: 'Configurações',
      href: '/settings',
    },
  ];

  const navigation = isProfessional ? professionalNavigation : adminNavigation;

  return (
    <>
      <header className="bg-background border-b border-border shadow-sm sticky top-0 z-40">
        <div className="container-brand">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  className="p-2"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              )}
              
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/images/OY.png" alt="Olharly Logo" className="w-6 h-6 object-contain" />
                </div>
                {!isMobile && (
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Olharly</h1>
                    <p className="text-xs text-muted-foreground">Agendamento Inteligente</p>
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Actions & User Info */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Bell className="w-4 h-4" />
                {isMobile && <span className="sr-only">Notificações</span>}
              </Button>

              {/* Settings - Desktop only */}
              {!isMobile && (
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              )}

              {/* Plan Info - Desktop only */}
              {!isMobile && currentPlan && (
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

              {/* User Info */}
              <div className="flex items-center space-x-2 pl-2 border-l border-border">
                <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gold-700" />
                </div>
                {!isMobile && (
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {user?.user_metadata?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isProfessional ? 'Profissional' : 'Administrador(a)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Logout - Mobile only */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Sair</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-30" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4">
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg mb-4">
                <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gold-700" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {user?.user_metadata?.full_name || 'Usuário'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isProfessional ? 'Profissional' : 'Administrador(a)'}
                  </p>
                </div>
              </div>

              {/* Plan Info Mobile */}
              {currentPlan && (
                <div className="flex items-center space-x-2 p-3 bg-gold-50 rounded-lg border border-gold-200 mb-4">
                  <Crown className="w-4 h-4 text-gold-600" />
                  <div className="text-sm">
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

              {/* Navigation Links */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ResponsiveHeader;