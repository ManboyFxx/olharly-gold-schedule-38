
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone, Calendar, Settings } from 'lucide-react';

type UserRole = 'super_admin' | 'organization_admin' | 'professional' | 'client';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

interface UserCardProps {
  user: User;
  onToggleUser: (userId: string, currentStatus: boolean) => void;
  isToggling: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onToggleUser, isToggling }) => {
  const getRoleBadge = (role: UserRole) => {
    const roleMap: Record<UserRole, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      'super_admin': { label: 'Super Admin', variant: 'default' },
      'organization_admin': { label: 'Admin', variant: 'default' },
      'professional': { label: 'Profissional', variant: 'secondary' },
      'client': { label: 'Cliente', variant: 'outline' },
    };
    
    const roleInfo = roleMap[role] || { label: role, variant: 'outline' as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <Card className="card-elegant">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h4 className="font-medium text-foreground">{user.full_name}</h4>
              {getRoleBadge(user.role)}
              {!user.is_active && (
                <Badge variant="destructive">Inativo</Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {user.phone}
                </span>
              )}
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleUser(user.id, user.is_active)}
            disabled={isToggling || user.role === 'super_admin'}
          >
            {user.is_active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
