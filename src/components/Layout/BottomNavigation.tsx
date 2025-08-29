
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
  CalendarCheck
} from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isProfessional = user && ['professional', 'organization_admin', 'super_admin'].includes(user.role || '');

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
    ...(isProfessional ? [{
      name: 'Meu Booking',
      href: '/my-booking',
      icon: CalendarCheck,
    }] : []),
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
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
      <nav className="flex justify-around items-center py-2 px-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 px-1 py-2 rounded-lg transition-all duration-200 touch-target min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-full leading-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavigation;
