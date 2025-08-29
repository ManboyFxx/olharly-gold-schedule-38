
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { PermissionGate } from '@/components/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Users, Plus } from 'lucide-react';
import UserForm from './UserForm';
import UserCard from './UserCard';

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

type UserRole = 'super_admin' | 'organization_admin' | 'professional' | 'client';

interface NewUserForm {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

const UserManagement = () => {
  const { organization } = useOrganization();
  const { checkLimit } = usePermissions();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch users with error handling
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organization.id)
        .neq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as User[];
    },
    enabled: !!organization?.id,
  });

  // Check professional limit
  const professionalLimit = checkLimit('professionals');
  const canAddProfessional = professionalLimit.allowed;

  // Add user mutation with improved error handling
  const addUserMutation = useMutation({
    mutationFn: async (userData: NewUserForm) => {
      if (!organization?.id) throw new Error('Organization not found');
      
      // Client-side validation
      if (userData.role === 'professional' && !canAddProfessional) {
        throw new Error('Limite de profissionais atingido');
      }

      // Additional security: prevent super_admin creation
      if (userData.role === 'super_admin') {
        throw new Error('Não é possível criar super administradores');
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          organization_id: organization.id,
          id: crypto.randomUUID(),
        });

      if (error) {
        // Handle specific error cases
        if (error.code === '23505' && error.message.includes('email')) {
          throw new Error('Este email já está em uso');
        }
        if (error.code === '42501') {
          throw new Error('Permissão insuficiente para criar usuário');
        }
        throw new Error('Erro ao criar usuário. Verifique os dados e tente novamente.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', organization?.id] });
      toast({
        title: 'Usuário adicionado',
        description: 'Usuário foi adicionado com sucesso.',
      });
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle user active status with security checks
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // Prevent self-deactivation
      const currentUser = await supabase.auth.getUser();
      if (currentUser.data.user?.id === userId && isActive) {
        throw new Error('Você não pode desativar sua própria conta');
      }

      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        if (error.code === '42501') {
          throw new Error('Permissão insuficiente para alterar status do usuário');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', organization?.id] });
      toast({
        title: 'Usuário atualizado',
        description: 'Status do usuário foi atualizado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddUser = (userData: NewUserForm) => {
    addUserMutation.mutate(userData);
  };

  const handleToggleUser = (userId: string, currentStatus: boolean) => {
    toggleUserMutation.mutate({ userId, isActive: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="card-elegant">
        <div className="text-center py-8">
          <div className="text-destructive mb-2">Erro ao carregar usuários</div>
          <p className="text-sm text-muted-foreground">
            Verifique suas permissões e tente novamente.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Usuários da Organização</h3>
          <p className="text-sm text-muted-foreground">
            {professionalLimit.isUnlimited 
              ? 'Profissionais ilimitados' 
              : `${professionalLimit.current}/${professionalLimit.limit} profissionais`
            }
          </p>
        </div>
        
        <PermissionGate
          limitType="professionals"
          feature="Adicionar Profissional"
          fallback={
            <Button variant="outline" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          }
        >
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        </PermissionGate>
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        isLoading={addUserMutation.isPending}
        canAddProfessional={canAddProfessional}
      />

      {/* Users List */}
      <div className="grid gap-4">
        {users?.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onToggleUser={handleToggleUser}
            isToggling={toggleUserMutation.isPending}
          />
        ))}
        
        {users?.length === 0 && (
          <Card className="card-elegant">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h4>
              <p className="text-sm text-muted-foreground">
                Adicione profissionais e administradores para sua organização.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
