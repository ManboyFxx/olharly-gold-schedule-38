
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Save, Eye } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/hooks/use-toast';

interface ProfessionalProfile {
  id: string;
  full_name: string;
  email: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  slug?: string;
  public_profile_enabled: boolean;
  accept_online_booking: boolean;
  phone?: string;
  role: string;
}

const PublicProfileManager = () => {
  const { professionals, updateProfessionalProfile, generateSlugFromName } = useProfiles();
  const { organization } = useOrganization();
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfessionalProfile>>({});

  const handleEdit = (professional: ProfessionalProfile) => {
    setEditingProfile(professional.id);
    setFormData({
      title: professional.title || '',
      bio: professional.bio || '',
      slug: professional.slug || generateSlugFromName(professional.full_name),
      public_profile_enabled: professional.public_profile_enabled,
      accept_online_booking: professional.accept_online_booking,
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

  const getPublicUrl = (professional: ProfessionalProfile) => {
    if (!professional.slug) return null;
    
    // Usar domínio atual + /slug (sem /booking)
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/${professional.slug}`;
  };

  const handleSlugChange = (value: string) => {
    // Formatar automaticamente o slug
    const formattedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50); // Limitar tamanho

    setFormData(prev => ({ ...prev, slug: formattedSlug }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Perfis Públicos</h2>
          <p className="text-muted-foreground">
            Configure os perfis públicos dos profissionais para agendamento online
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {professional.full_name}
                    {professional.public_profile_enabled && (
                      <Badge variant="secondary">Público</Badge>
                    )}
                    {professional.accept_online_booking && (
                      <Badge variant="default">Agendamento Online</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{professional.title || 'Sem título definido'}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {professional.slug && professional.public_profile_enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getPublicUrl(professional), '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Perfil
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(professional)}
                    disabled={editingProfile === professional.id}
                  >
                    Configurar
                  </Button>
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
                    <Label htmlFor={`bio-${professional.id}`}>Biografia</Label>
                    <Textarea
                      id={`bio-${professional.id}`}
                      value={formData.bio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Descreva a experiência e especialidades..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`slug-${professional.id}`}>URL do Perfil</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {window.location.host}/
                      </span>
                      <Input
                        id={`slug-${professional.id}`}
                        value={formData.slug || ''}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="nome-do-profissional"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use apenas letras minúsculas, números e hífens
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Perfil Público</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir que clientes vejam o perfil do profissional
                      </p>
                    </div>
                    <Switch
                      checked={formData.public_profile_enabled || false}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, public_profile_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Agendamento Online</Label>
                      <p className="text-xs text-muted-foreground">
                        Permitir agendamentos diretos pelo site
                      </p>
                    </div>
                    <Switch
                      checked={formData.accept_online_booking || false}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, accept_online_booking: checked }))
                      }
                    />
                  </div>

                  {formData.slug && formData.public_profile_enabled && (
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-medium mb-1">URL do Perfil Público:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-background px-2 py-1 rounded">
                          {getPublicUrl({ ...professional, slug: formData.slug })}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = getPublicUrl({ ...professional, slug: formData.slug });
                            if (url) {
                              navigator.clipboard.writeText(url);
                              toast({
                                title: 'URL copiada!',
                                description: 'A URL foi copiada para sua área de transferência.',
                              });
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleSave(professional.id)}
                    disabled={!formData.slug?.trim()}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
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
              Nenhum profissional encontrado. Adicione profissionais à sua organização primeiro.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfileManager;
