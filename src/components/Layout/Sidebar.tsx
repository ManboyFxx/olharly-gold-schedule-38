
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  Settings, 
  Home,
  CreditCard,
  BarChart3,
  CalendarCheck
} from 'lucide-react';


const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isProfessional = user && ['professional', 'organization_admin', 'super_admin'].includes(user.role || '');
  
  console.log('User role:', user?.role, 'isProfessional:', isProfessional);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Calendário',
      href: '/calendar',
      icon: Calendar,
    },
    {
      name: 'Meu espaço',
      href: '/my-booking',
      icon: CalendarCheck,
    },
    {
      name: 'Serviços',
      href: '/services',
      icon: Briefcase,
    },
    {
      name: 'Clientes',
      href: '/clients',
      icon: Users,
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: 'Planos',
      href: '/plans',
      icon: CreditCard,
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
    },
  ];

  console.log('Navigation items:', navigation);

  return (
    <div className="w-64 bg-background border-r border-border h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-lg text-foreground">Olharly</span>
        </div>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
