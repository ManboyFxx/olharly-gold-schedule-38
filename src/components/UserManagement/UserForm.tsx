
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type UserRole = 'super_admin' | 'organization_admin' | 'professional' | 'client';

interface NewUserForm {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: NewUserForm) => void;
  isLoading: boolean;
  canAddProfessional: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  canAddProfessional 
}) => {
  const [formData, setFormData] = useState<NewUserForm>({
    email: '',
    full_name: '',
    phone: '',
    role: 'professional'
  });

  const [errors, setErrors] = useState<Partial<NewUserForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<NewUserForm> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email muito longo';
    }

    // Name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Nome é obrigatório';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.full_name.length > 100) {
      newErrors.full_name = 'Nome muito longo';
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Telefone muito longo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Sanitize data
    const sanitizedData: NewUserForm = {
      email: formData.email.trim().toLowerCase(),
      full_name: formData.full_name.trim(),
      phone: formData.phone?.trim() || undefined,
      role: formData.role
    };
    
    onSubmit(sanitizedData);
  };

  const handleClose = () => {
    setFormData({ email: '', full_name: '', phone: '', role: 'professional' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@exemplo.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nome completo"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="role">Função *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  value="professional"
                  disabled={!canAddProfessional}
                >
                  Profissional {!canAddProfessional && '(Limite atingido)'}
                </SelectItem>
                <SelectItem value="organization_admin">Admin da Organização</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !formData.email || !formData.full_name}
              className="flex-1"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
