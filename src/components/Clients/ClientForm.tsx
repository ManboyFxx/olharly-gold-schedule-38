
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ClientFormProps {
  clientId?: string | null;
  onBack: () => void;
  onSave: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ clientId, onBack, onSave }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    notes: '',
    tags: [] as string[],
    status: 'active'
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!clientId;

  useEffect(() => {
    if (clientId) {
      // Aqui carregaria os dados do cliente do Supabase
      // Por enquanto, usando dados mock
      setFormData({
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '(11) 99999-9999',
        birthDate: '1985-05-15',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        notes: 'Cliente preferencial, sempre pontual.',
        tags: ['VIP', 'Regular'],
        status: 'active'
      });
    }
  }, [clientId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui faria a integração com Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula API call

      toast({
        title: isEditing ? "Cliente atualizado!" : "Cliente criado!",
        description: isEditing 
          ? "Os dados do cliente foram atualizados com sucesso."
          : "O novo cliente foi cadastrado com sucesso.",
      });

      onSave();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = (tag: string) => {
    const colors = {
      'VIP': 'bg-gold-100 text-gold-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Regular': 'bg-blue-100 text-blue-800',
      'Novo': 'bg-green-100 text-green-800',
      'Fidelizado': 'bg-orange-100 text-orange-800'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className={cn(
      "space-y-6",
      isMobile && "space-y-4"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center space-x-4",
        isMobile && "flex-col items-start space-y-3 space-x-0"
      )}>
        <Button
          variant="ghost"
          onClick={onBack}
          className={cn(
            "text-earth-600 hover:text-earth-800",
            isMobile && "self-start"
          )}
        >
          <ArrowLeft className={cn(
            "mr-2",
            isMobile ? "w-5 h-5" : "w-4 h-4"
          )} />
          Voltar
        </Button>
        <div className={isMobile ? "w-full" : ""}>
          <h2 className={cn(
            "font-bold text-earth-900",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <p className={cn(
            "text-earth-600",
            isMobile && "text-sm"
          )}>
            {isEditing ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-sand-200 shadow-soft">
        <CardHeader className={cn(
          isMobile && "px-4 py-4"
        )}>
          <CardTitle className={cn(
            "text-earth-900",
            isMobile ? "text-lg" : "text-xl"
          )}>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className={cn(
          isMobile && "px-4 pb-4"
        )}>
          <form onSubmit={handleSubmit} className={cn(
            "space-y-6",
            isMobile && "space-y-4"
          )}>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-earth-700 mb-2 block">
                  Nome Completo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                  className="border-sand-300 focus:border-gold focus:ring-gold/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-earth-700 mb-2 block">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="cliente@email.com"
                  required
                  className="border-sand-300 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-earth-700 mb-2 block">
                  Telefone *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="border-sand-300 focus:border-gold focus:ring-gold/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-earth-700 mb-2 block">
                  Data de Nascimento
                </label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="border-sand-300 focus:border-gold focus:ring-gold/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-earth-700 mb-2 block">
                Endereço
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                className="border-sand-300 focus:border-gold focus:ring-gold/20"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-earth-700 mb-2 block">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Digite uma tag"
                    className="flex-1 border-sand-300 focus:border-gold focus:ring-gold/20"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-gold hover:bg-gold-600 text-earth-900"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className={`${getTagColor(tag)} cursor-pointer hover:opacity-80`}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-earth-700 mb-2 block">
                Observações
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Adicione observações importantes sobre o cliente..."
                rows={4}
                className="border-sand-300 focus:border-gold focus:ring-gold/20"
              />
            </div>

            {/* Actions */}
            <div className={cn(
              "flex pt-6 border-t border-sand-200",
              isMobile ? "flex-col space-y-3" : "justify-end space-x-3"
            )}>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className={cn(
                  "border-sand-300 text-earth-700 hover:bg-sand-50",
                  isMobile && "w-full h-12"
                )}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "bg-gold hover:bg-gold-600 text-earth-900 font-semibold",
                  isMobile && "w-full h-12"
                )}
              >
                <Save className={cn(
                  "mr-2",
                  isMobile ? "w-5 h-5" : "w-4 h-4"
                )} />
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientForm;
