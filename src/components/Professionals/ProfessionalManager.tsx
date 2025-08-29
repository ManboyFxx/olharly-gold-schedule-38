import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X, UserPlus } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfessionalProfile {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  phone?: string;
  role: string;
  accept_online_booking: boolean;
}

interface AddProfessionalForm {
  email: string;
  full_name: string;
  phone?: string;
  title?: string;
  role: 'professional' | 'organization_admin';
}

const ProfessionalManager = () => {
  const { professionals, updateProfessionalProfile, refetch } = useProfiles();
  const { organization } = useOrganization();
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfessionalProfile>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<AddProfessionalForm>({
    email: '',
    full_name: '',
    phone: '',
    title: '',
    role: 'professional'
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (professional: ProfessionalProfile) => {
    setEditingProfile(professional.id);
    setFormData({
      title: professional.title || '',
      phone: professional.phone || '',
    });
  };

  const handleSave = async (professionalId: string) => {
    const result = await updateProfessionalProfile(professionalId, formData);
    
    if (!result.error) {
      setEditingProfile(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setEditingProfile(null);
    setFormData({});
  };

  const handleAddProfessional = async (formData: AddProfessionalForm) => {
    if (!organization?.id) return;
    
    setIsAdding(true);
    try {
      // Criar usuário no auth.users via edge function
      const { data, error } = await supabase.functions.invoke('create-professional', {
        body: {
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          title: formData.title,
          role: formData.role,
          organization_id: organization.id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Profissional adicionado!',
        description: `${formData.full_name} foi adicionado à organização. Login enviado para: ${formData.email}`,
      });
      
      setIsAddModalOpen(false);
      setAddFormData({
        email: '',
        full_name: '',
        phone: '',
        title: '',
        role: 'professional'
      });
      
      // Atualizar a lista de profissionais
      refetch();
      
    } catch (error: any) {
      console.error('Error creating professional:', error);
      toast({
        title: 'Erro ao adicionar profissional',
        description: error.message || 'Ocorreu um erro ao adicionar o profissional.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const validateAddForm = (): boolean => {
    if (!addFormData.email || !addFormData.full_name) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profissionais</h2>
          <p className="text-muted-foreground">
            Gerencie os profissionais da sua organização
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Profissional
        </Button>
      </div>

      <div className="grid gap-4">
        {professionals.map((professional) => (
          <Card key={professional.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {professional.full_name}
                    {professional.accept_online_booking && (
                      <Badge variant="default">Agendamento Ativo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span>{professional.title || 'Sem título definido'}</span>
                    <span className="text-xs">{professional.email}</span>
                    {professional.phone && (
                      <span className="text-xs">{professional.phone}</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {editingProfile === professional.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(professional.id)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(professional)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {editingProfile === professional.id && (
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor={`title-${professional.id}`}>Título/Especialidade</Label>
                    <Input
                      id={`title-${professional.id}`}
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Psicólogo Clínico - CRP 12345"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`phone-${professional.id}`}>Telefone</Label>
                    <Input
                      id={`phone-${professional.id}`}
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum profissional encontrado. Adicione profissionais à sua organização.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Professional Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent aria-describedby="add-professional-description">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Profissional</DialogTitle>
          </DialogHeader>
          <div id="add-professional-description" className="sr-only">
            Formulário para adicionar um novo profissional à organização
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="profissional@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="add-full-name">Nome Completo *</Label>
              <Input
                id="add-full-name"
                value={addFormData.full_name}
                onChange={(e) => setAddFormData({ ...addFormData, full_name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="add-title">Título/Especialidade</Label>
              <Input
                id="add-title"
                value={addFormData.title}
                onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                placeholder="Ex: Psicólogo Clínico - CRP 12345"
              />
            </div>
            
            <div>
              <Label htmlFor="add-phone">Telefone</Label>
              <Input
                id="add-phone"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="add-role">Função *</Label>
              <Select 
                value={addFormData.role} 
                onValueChange={(value: 'professional' | 'organization_admin') => 
                  setAddFormData({ ...addFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="organization_admin">Admin da Organização</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => handleAddProfessional(addFormData)}
                disabled={isAdding || !validateAddForm()}
                className="flex-1"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddModalOpen(false)}
                disabled={isAdding}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalManager;