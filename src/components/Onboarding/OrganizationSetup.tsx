import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, User, ArrowRight } from 'lucide-react';
import { getDomainInfo } from '@/lib/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const OrganizationSetup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });
  
  const { createOrganization } = useOrganization();
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData({
      name: value,
      slug: generateSlug(value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da organização é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await createOrganization(formData);
      
      if (error) {
        toast({
          title: 'Erro ao criar organização',
          description: error.message || 'Tente novamente',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Organização criada!',
          description: 'Bem-vindo ao Olharly! Vamos configurar seus serviços.',
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
            <Building className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-display-sm font-bold text-foreground mb-2">
            Bem-vindo ao Olharly! 🎉
          </h1>
          <p className="text-muted-foreground">
            Vamos configurar sua organização para começar a receber agendamentos
          </p>
        </div>

        {/* Setup Form */}
        <Card className="card-elegant">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Configuração Inicial</h2>
                <p className="text-sm text-muted-foreground">Informações básicas da sua organização</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Organização *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Clínica Maria Silva"
                  className="input-elegant"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este nome aparecerá para seus clientes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Link Personalizado *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-muted bg-muted text-muted-foreground text-sm">
                    {getDomainInfo().hostname}/
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="clinica-maria-silva"
                    className="rounded-l-none"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Seus clientes acessarão: <strong>{getDomainInfo().hostname}/{formData.slug || 'seu-link'}</strong>
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full btn-gold" 
                  disabled={loading || !formData.name.trim()}
                >
                  {loading ? 'Criando organização...' : 'Continuar'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Features Preview */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Após a configuração, você poderá:
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Criar e gerenciar serviços</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Receber agendamentos online</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>Personalizar sua marca</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSetup;