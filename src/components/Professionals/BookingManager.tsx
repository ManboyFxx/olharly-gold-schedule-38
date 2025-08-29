import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { useServices } from '@/hooks/useServices';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, Eye, Plus, Edit3, Trash2 } from 'lucide-react';
import { generateProfessionalUrl } from '@/lib/domain';

export const BookingManager = () => {
  const { user } = useAuth();
  const { professionals, updateProfessionalProfile, generateSlugFromName } = useProfiles();
  const { services, loading: servicesLoading } = useServices();
  
  const [profileData, setProfileData] = useState({
    slug: '',
    title: '',
    bio: '',
    public_profile_enabled: false,
    accept_online_booking: false,
  });

  const currentProfessional = professionals.find(p => p.id === user?.id);
  const professionalServices = services.filter(s => s.professional_id === user?.id && s.is_active);

  useEffect(() => {
    if (currentProfessional) {
      setProfileData({
        slug: currentProfessional.slug || '',
        title: currentProfessional.title || '',
        bio: currentProfessional.bio || '',
        public_profile_enabled: currentProfessional.public_profile_enabled,
        accept_online_booking: currentProfessional.accept_online_booking,
      });
    }
  }, [currentProfessional]);

  const handleGenerateSlug = () => {
    if (currentProfessional?.full_name) {
      const generatedSlug = generateSlugFromName(currentProfessional.full_name);
      setProfileData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const result = await updateProfessionalProfile(user.id, profileData);
    
    if (!result.error) {
      toast({
        title: 'Sucesso',
        description: 'Configurações do booking atualizadas com sucesso.',
      });
    }
  };

  const bookingUrl = profileData.slug ? generateProfessionalUrl(profileData.slug) : '';

  return (
    <div className="space-y-6">
      {/* Configurações do Perfil Público */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Perfil Público
          </CardTitle>
          <CardDescription>
            Configure como seu perfil aparecerá para os clientes no sistema de agendamento online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Perfil público ativado</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes vejam seu perfil e agendem consultas
              </p>
            </div>
            <Switch
              checked={profileData.public_profile_enabled}
              onCheckedChange={(checked) => 
                setProfileData(prev => ({ ...prev, public_profile_enabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Aceitar agendamentos online</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes façam agendamentos diretamente pelo seu link
              </p>
            </div>
            <Switch
              checked={profileData.accept_online_booking}
              onCheckedChange={(checked) => 
                setProfileData(prev => ({ ...prev, accept_online_booking: checked }))
              }
            />
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="slug">URL Personalizada</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="slug"
                  placeholder="seu-nome"
                  value={profileData.slug}
                  onChange={(e) => setProfileData(prev => ({ ...prev, slug: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateSlug}
                >
                  Gerar
                </Button>
              </div>
              {bookingUrl && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Sua URL de agendamento:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-background px-2 py-1 rounded">{bookingUrl}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(bookingUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title">Título Profissional</Label>
              <Input
                id="title"
                placeholder="Ex: Designer de Sobrancelhas e Extensão de Cílios"
                value={profileData.title}
                onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre sua experiência e especialidades..."
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Serviços Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Seus Serviços
            </span>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </CardTitle>
          <CardDescription>
            Gerencie os serviços que os clientes podem agendar com você
          </CardDescription>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Carregando serviços...</p>
            </div>
          ) : professionalServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Você ainda não tem serviços cadastrados
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Serviço
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {professionalServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge variant="secondary">
                        {service.duration_minutes}min
                      </Badge>
                      {service.price_cents && (
                        <Badge variant="outline">
                          R$ {(service.price_cents / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview do Booking */}
      {profileData.public_profile_enabled && profileData.accept_online_booking && bookingUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Preview do Agendamento</CardTitle>
            <CardDescription>
              Veja como seus clientes verão a página de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {currentProfessional?.full_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentProfessional?.full_name}</h3>
                  {profileData.title && (
                    <p className="text-muted-foreground">{profileData.title}</p>
                  )}
                </div>
                {profileData.bio && (
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {profileData.bio}
                  </p>
                )}
                <Button className="mt-4">
                  Agendar Consulta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};