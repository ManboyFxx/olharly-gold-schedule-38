import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useServices } from '@/hooks/useServices';
import { toast } from '@/hooks/use-toast';

interface ServiceFormProps {
  serviceId?: string | null;
  onClose: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, onClose }) => {
  const { services, createService, updateService } = useServices();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price_cents: 0,
    color: '#E6B800',
    requires_approval: false,
    is_active: true
  });

  const isEditing = !!serviceId;
  const existingService = services.find(s => s.id === serviceId);

  useEffect(() => {
    if (existingService) {
      setFormData({
        name: existingService.name,
        description: existingService.description || '',
        duration_minutes: existingService.duration_minutes,
        price_cents: existingService.price_cents,
        color: existingService.color,
        requires_approval: existingService.requires_approval,
        is_active: existingService.is_active
      });
    }
  }, [existingService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do serviço é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = isEditing 
        ? await updateService(serviceId!, formData)
        : await createService(formData);

      if (error) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar serviço',
          variant: 'destructive',
        });
      } else {
        toast({
          title: isEditing ? 'Serviço atualizado!' : 'Serviço criado!',
          description: 'As alterações foram salvas com sucesso.',
        });
        onClose();
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

  const formatCentsToReals = (cents: number) => {
    return (cents / 100).toFixed(2).replace('.', ',');
  };

  const parseRealsTocents = (reais: string) => {
    const cleanValue = reais.replace(',', '.');
    const floatValue = parseFloat(cleanValue) || 0;
    return Math.round(floatValue * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique as informações do serviço' : 'Adicione um novo serviço ao seu catálogo'}
          </p>
        </div>
      </div>

      <Card className="card-elegant max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Consulta Nutricional"
                className="input-elegant"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor do Serviço</Label>
              <div className="flex space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#E6B800"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva brevemente o serviço..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                className="input-elegant"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="text"
                value={formatCentsToReals(formData.price_cents)}
                onChange={(e) => setFormData({ ...formData, price_cents: parseRealsTocents(e.target.value) })}
                placeholder="0,00"
                className="input-elegant"
              />
              <p className="text-xs text-muted-foreground">
                Deixe 0,00 para serviços gratuitos
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requires_approval">Requer Aprovação</Label>
                <p className="text-sm text-muted-foreground">
                  Agendamentos precisam ser aprovados manualmente
                </p>
              </div>
              <Switch
                id="requires_approval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Serviço Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Clientes podem agendar este serviço
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="btn-gold">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Serviço')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ServiceForm;