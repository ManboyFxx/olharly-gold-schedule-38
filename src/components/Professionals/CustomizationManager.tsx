import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Palette, Clock, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from '@/hooks/use-toast';

const CustomizationManager = () => {
  const { user } = useAuth();
  const { organization, updateOrganization } = useOrganization();
  const { professionals, updateProfessionalProfile } = useProfiles();
  const [loading, setLoading] = useState(false);
  
  // Buscar o perfil da profissional atual
  const currentProfile = professionals.find(p => p.id === user?.id);
  
  // Estado para informações da organização
  const [organizationData, setOrganizationData] = useState({
    name: organization?.name || '',
    email: organization?.email || '',
    phone: organization?.phone || '',
  });
  
  // Estado para informações do profissional
  const [professionalData, setProfessionalData] = useState({
    title: currentProfile?.title || '',
    bio: currentProfile?.bio || '',
    accept_online_booking: currentProfile?.accept_online_booking || false,
  });

  // Atualizar dados quando a organização carregar
  useEffect(() => {
    if (organization) {
      setOrganizationData({
        name: organization.name || '',
        email: organization.email || '',
        phone: organization.phone || '',
      });
    }
  }, [organization]);


  const handleSave = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Salvar informações da organização
      if (organization) {
        const orgResult = await updateOrganization(organizationData);
        if (orgResult.error) {
          throw new Error('Erro ao salvar informações da organização');
        }
      }

      // Salvar informações do profissional
      const profResult = await updateProfessionalProfile(user.id, professionalData);
      if (profResult.error) {
        throw new Error('Erro ao salvar informações do profissional');
      }
      
      toast({
        title: 'Sucesso',
        description: 'Suas configurações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar configurações. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Faça login para personalizar seu espaço.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalização</h2>
          <p className="text-muted-foreground">
            Configure sua agenda e personalize seu espaço de atendimento
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Informações Gerais da Organização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
            <CardDescription>
              Configure as informações básicas da sua organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="org-name">Nome da Organização</Label>
              <Input
                id="org-name"
                value={organizationData.name}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da sua empresa ou clínica"
              />
            </div>

            <div>
              <Label htmlFor="org-email">E-mail de Contato</Label>
              <Input
                id="org-email"
                type="email"
                value={organizationData.email}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="org-phone">Telefone</Label>
              <Input
                id="org-phone"
                value={organizationData.phone}
                onChange={(e) => setOrganizationData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações da Profissional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações da Profissional
            </CardTitle>
            <CardDescription>
              Configure suas informações profissionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título/Especialidade</Label>
              <Input
                id="title"
                value={professionalData.title}
                onChange={(e) => setProfessionalData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Psicólogo Clínico - CRP 12345"
              />
            </div>

            <div>
              <Label htmlFor="bio">Descrição/Bio</Label>
              <Textarea
                id="bio"
                value={professionalData.bio}
                onChange={(e) => setProfessionalData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Descreva sua experiência, especialidades e abordagem..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configurações de Agendamento
            </CardTitle>
            <CardDescription>
              Configure suas preferências de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aceitar Agendamentos Online</Label>
                <p className="text-xs text-muted-foreground">
                  Permitir que clientes agendem diretamente com você
                </p>
              </div>
              <Switch
                checked={professionalData.accept_online_booking}
                onCheckedChange={(checked) => 
                  setProfessionalData(prev => ({ ...prev, accept_online_booking: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações Visuais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência do seu espaço de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Configurações de tema e cores em desenvolvimento...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomizationManager;