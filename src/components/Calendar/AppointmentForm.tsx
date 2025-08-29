import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Calendar, Clock, User } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfiles } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  onClose: () => void;
  selectedDate?: Date;
  appointmentId?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  onClose, 
  selectedDate = new Date(),
  appointmentId 
}) => {
  const { services } = useServices();
  const { createAppointment, updateAppointment, appointments } = useAppointments();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { professionals } = useProfiles();

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_id: '',
    professional_id: '',
    scheduled_date: selectedDate.toISOString().split('T')[0],
    scheduled_time: '',
    notes: '',
    client_notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        const scheduledDate = new Date(appointment.scheduled_at);
        setFormData({
          client_name: appointment.client_name || '',
          client_email: appointment.client_email || '',
          client_phone: appointment.client_phone || '',
          service_id: appointment.service_id,
          professional_id: appointment.professional_id || '',
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_time: scheduledDate.toTimeString().slice(0, 5),
          notes: appointment.notes || '',
          client_notes: appointment.client_notes || ''
        });
      }
    }
  }, [appointmentId, appointments]);

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

    setLoading(true);
    
    try {
      const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      const appointmentData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        service_id: formData.service_id,
        professional_id: formData.professional_id,
        scheduled_at: scheduledAt.toISOString(),
        notes: formData.notes,
        client_notes: formData.client_notes,
        status: 'scheduled' as const
      };

      if (appointmentId) {
        await updateAppointment(appointmentId, appointmentData);
        toast({
          title: 'Sucesso',
          description: 'Agendamento atualizado com sucesso'
        });
      } else {
        await createAppointment(appointmentData);
        toast({
          title: 'Sucesso',
          description: 'Agendamento criado com sucesso'
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar agendamento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.service_id);

  return (
    <div className={cn(
      "w-full",
      isMobile ? "min-h-screen bg-background" : "max-w-2xl mx-auto"
    )}>
      <Card className={cn(
        "card-elegant",
        isMobile ? "rounded-none border-0 shadow-none min-h-screen" : ""
      )}>
        {/* Mobile Header */}
        {isMobile ? (
          <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {appointmentId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Desktop Header */
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {appointmentId ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados do agendamento
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

      <form onSubmit={handleSubmit} className={cn(
        "space-y-6",
        isMobile ? "p-4 pb-24" : ""
      )}>
        {/* Informações do Cliente */}
        <div className={cn(
          "space-y-4",
          isMobile ? "bg-card rounded-lg p-4 border border-border" : ""
        )}>
          <h3 className={cn(
            "font-medium text-foreground flex items-center",
            isMobile ? "text-base" : "text-lg"
          )}>
            <User className={cn(
              "mr-2 text-primary",
              isMobile ? "w-5 h-5" : "w-5 h-5"
            )} />
            Dados do Cliente
          </h3>
          
          <div className={cn(
            "gap-4",
            isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2"
          )}>
            <div className="space-y-2">
              <Label htmlFor="client_name" className={cn(
                isMobile ? "text-base font-medium" : ""
              )}>Nome Completo *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Nome do cliente"
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

        {/* Serviço e Agendamento */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Serviço e Horário
          </h3>
          
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
                      <span className="text-muted-foreground">
                        ({service.duration_minutes}min)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                {professionals.filter(p => p.role === 'professional' || p.role === 'organization_admin').map((professional) => (
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
                  Valor: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(selectedService.price_cents / 100)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className={cn(
              isMobile ? "text-base font-medium" : ""
            )}>Observações Internas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações para o profissional"
              rows={3}
              className={cn(
                isMobile ? "text-base px-4 py-3 min-h-[100px]" : ""
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client_notes" className={cn(
              isMobile ? "text-base font-medium" : ""
            )}>Observações do Cliente</Label>
            <Textarea
              id="client_notes"
              value={formData.client_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, client_notes: e.target.value }))}
              placeholder="Observações fornecidas pelo cliente"
              rows={3}
              className={cn(
                isMobile ? "text-base px-4 py-3 min-h-[100px]" : ""
              )}
            />
          </div>
        </div>

        {/* Botões */}
        <div className={cn(
          "pt-4 border-t",
          isMobile ? "fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex space-x-4" : "flex justify-end space-x-4"
        )}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            type="button"
            className={cn(
              isMobile ? "flex-1 h-12 text-base" : ""
            )}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "btn-gold",
              isMobile ? "flex-1 h-12 text-base" : ""
            )}
          >
            {loading ? 'Salvando...' : appointmentId ? 'Atualizar' : 'Criar Agendamento'}
          </Button>
         </div>
        </form>
      </Card>
    </div>
  );
};

export default AppointmentForm;