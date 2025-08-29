import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useServices } from '@/hooks/useServices';
import { useProfiles } from '@/hooks/useProfiles';
import { useAppointments } from '@/hooks/useAppointments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BookingFormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: string;
  professional_id: string;
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
  client_notes: string;
}

const ProfessionalBooking = () => {
  const { services } = useServices();
  const { professionals } = useProfiles();
  const { createAppointment } = useAppointments();
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<BookingFormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_id: '',
    professional_id: currentUser?.id || '',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '',
    notes: '',
    client_notes: ''
  });

  const [loading, setLoading] = useState(false);

  // Atualizar professional_id quando currentUser mudar
  useEffect(() => {
    if (currentUser?.id) {
      setFormData(prev => ({ ...prev, professional_id: currentUser.id }));
    }
  }, [currentUser]);

  // Filtrar profissionais ativos da mesma organização
  const availableProfessionals = professionals.filter(p => 
    (p.role === 'professional' || p.role === 'organization_admin') && 
    p.organization_id === currentUser?.organization_id
  );

  const selectedService = services.find(s => s.id === formData.service_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_id || !formData.professional_id || !formData.scheduled_date || !formData.scheduled_time) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.client_name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do cliente é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      const appointmentData = {
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim(),
        client_phone: formData.client_phone.trim(),
        service_id: formData.service_id,
        professional_id: formData.professional_id,
        scheduled_at: scheduledAt.toISOString(),
        notes: formData.notes.trim(),
        client_notes: formData.client_notes.trim(),
        status: 'scheduled' as const
      };

      await createAppointment(appointmentData);
      
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso'
      });
      
      // Limpar formulário
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        service_id: '',
        professional_id: currentUser?.id || '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '',
        notes: '',
        client_notes: ''
      });
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar agendamento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Novo Agendamento</h2>
          <p className="text-muted-foreground">
            Crie agendamentos para qualquer profissional da organização
          </p>
        </div>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Dados do Agendamento
          </CardTitle>
          <CardDescription>
            Preencha as informações do cliente e selecione o profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Dados do Cliente
              </h3>
              
              <div className={cn(
                "gap-4",
                isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2"
              )}>
                <div className="space-y-2">
                  <Label htmlFor="client_name" className={cn(
                    isMobile ? "text-base font-medium" : ""
                  )}>Nome do Cliente *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Nome completo"
                    className={cn(
                      isMobile ? "h-12 text-base px-4" : ""
                    )}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_email" className={cn(
                    isMobile ? "text-base font-medium" : ""
                  )}>E-mail</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className={cn(
                      isMobile ? "h-12 text-base px-4" : ""
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone" className={cn(
                  isMobile ? "text-base font-medium" : ""
                )}>Telefone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className={cn(
                    isMobile ? "h-12 text-base px-4" : ""
                  )}
                />
              </div>
            </div>

            {/* Seleção de Profissional e Serviço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Profissional e Serviço
              </h3>
              
              <div className={cn(
                "gap-4",
                isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2"
              )}>
                <div className="space-y-2">
                  <Label htmlFor="professional_id" className={cn(
                    isMobile ? "text-base font-medium" : ""
                  )}>Profissional *</Label>
                  <Select
                    value={formData.professional_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, professional_id: value }))}
                  >
                    <SelectTrigger className={cn(
                      isMobile ? "h-12 text-base px-4" : ""
                    )}>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProfessionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{professional.full_name}</span>
                            {professional.title && (
                              <span className="text-muted-foreground text-sm">
                                ({professional.title})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_id" className={cn(
                    isMobile ? "text-base font-medium" : ""
                  )}>Serviço *</Label>
                  <Select
                    value={formData.service_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_id: value }))}
                  >
                    <SelectTrigger className={cn(
                      isMobile ? "h-12 text-base px-4" : ""
                    )}>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.filter(s => s.is_active).map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: service.color }}
                            />
                            <span>{service.name}</span>
                            <span className="text-muted-foreground text-sm">
                              ({service.duration_minutes}min)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data e Horário */}
              <div className={cn(
                "gap-4",
                isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2"
              )}>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date" className={cn(
                    isMobile ? "text-base font-medium" : ""
                  )}>Data *</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className={cn(
                      isMobile ? "h-12 text-base px-4" : ""
                    )}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time" className={cn(
                    isMobile ? "text-base font-medium" : ""
                  )}>Horário *</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className={cn(
                      isMobile ? "h-12 text-base px-4" : ""
                    )}
                    required
                  />
                </div>
              </div>

              {/* Informações do Serviço Selecionado */}
              {selectedService && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedService.color }}
                    />
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Duração: {selectedService.duration_minutes} minutos
                  </p>
                  {selectedService.price_cents > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Valor: R$ {(selectedService.price_cents / 100).toFixed(2)}
                    </p>
                  )}
                  {selectedService.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedService.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Observações</h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className={cn(
                  isMobile ? "text-base font-medium" : ""
                )}>Observações internas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações para uso interno..."
                  className={cn(
                    isMobile ? "text-base px-4 py-3 min-h-[100px]" : ""
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_notes" className={cn(
                  isMobile ? "text-base font-medium" : ""
                )}>Observações do cliente</Label>
                <Textarea
                  id="client_notes"
                  value={formData.client_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_notes: e.target.value }))}
                  placeholder="Observações ou solicitações especiais do cliente..."
                  className={cn(
                    isMobile ? "text-base px-4 py-3 min-h-[100px]" : ""
                  )}
                />
              </div>
            </div>

            {/* Botões */}
            <div className={cn(
              "pt-4 border-t",
              isMobile ? "space-y-4" : "flex justify-end space-x-4"
            )}>
              <Button 
                type="submit" 
                disabled={loading} 
                className={cn(
                  "btn-gold",
                  isMobile ? "w-full h-12 text-base" : ""
                )}
              >
                {loading ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalBooking;