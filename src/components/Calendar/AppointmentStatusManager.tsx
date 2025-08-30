import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit3, Trash2, MessageSquare, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string;
  services?: {
    name: string;
  };
}

interface AppointmentStatusManagerProps {
  appointment: Appointment;
  onUpdate: () => void;
  isMobile?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Concluído', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  { value: 'no_show', label: 'Não Compareceu', color: 'bg-gray-100 text-gray-800' }
];

const MESSAGE_TEMPLATES = {
  confirmed: `Olá ${'{client_name}'}! Seu agendamento para ${'{service_name}'} no dia ${'{date}'} às ${'{time}'} foi confirmado. Nos vemos lá! 😊`,
  cancelled: `Olá ${'{client_name}'}! Infelizmente seu agendamento para ${'{service_name}'} no dia ${'{date}'} às ${'{time}'} foi cancelado. Entre em contato para reagendar.`,
  reminder: `Olá ${'{client_name}'}! Lembrando do seu agendamento para ${'{service_name}'} amanhã às ${'{time}'}. Confirme sua presença! 📅`,
  completed: `Olá ${'{client_name}'}! Obrigado por comparecer ao seu agendamento de ${'{service_name}'}. Esperamos vê-lo novamente em breve! ⭐`
};

export const AppointmentStatusManager: React.FC<AppointmentStatusManagerProps> = ({
  appointment,
  onUpdate,
  isMobile = false
}) => {
  const [loading, setLoading] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState<keyof typeof MESSAGE_TEMPLATES>('reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const { toast } = useToast();

  const updateStatus = async (newStatus: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          ...(newStatus === 'cancelled' && cancellationReason && { cancellation_reason: cancellationReason })
        })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Agendamento marcado como: ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`,
      });

      // Send automatic message based on status change
      if (newStatus === 'confirmed' || newStatus === 'cancelled' || newStatus === 'completed') {
        await sendStatusMessage(newStatus as keyof typeof MESSAGE_TEMPLATES);
      }

      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do agendamento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: 'Agendamento removido',
        description: 'O agendamento foi removido com sucesso',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover agendamento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendStatusMessage = async (type: keyof typeof MESSAGE_TEMPLATES) => {
    const template = MESSAGE_TEMPLATES[type];
    const message = template
      .replace('{client_name}', appointment.client_name)
      .replace('{service_name}', appointment.services?.name || 'serviço')
      .replace('{date}', new Date(appointment.scheduled_at).toLocaleDateString('pt-BR'))
      .replace('{time}', new Date(appointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

    // Here you would integrate with WhatsApp API
    console.log('Sending message:', message, 'to:', appointment.client_phone);
    
    toast({
      title: 'Mensagem enviada',
      description: `Mensagem de ${STATUS_OPTIONS.find(s => s.value === type)?.label.toLowerCase()} enviada`,
    });
  };

  const sendCustomMessage = async () => {
    if (!customMessage.trim()) return;

    try {
      // Here you would integrate with WhatsApp API
      console.log('Sending custom message:', customMessage, 'to:', appointment.client_phone);
      
      toast({
        title: 'Mensagem enviada',
        description: 'Mensagem personalizada enviada via WhatsApp',
      });

      setCustomMessage('');
      setShowMessageDialog(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    }
  };

  const openWhatsApp = () => {
    if (appointment.client_phone) {
      const phone = appointment.client_phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  const makeCall = () => {
    if (appointment.client_phone) {
      window.open(`tel:${appointment.client_phone}`, '_blank');
    }
  };

  return (
    <div className={cn("flex gap-2", isMobile ? "flex-col" : "flex-row")}>
      {/* Status Selector */}
      <Select 
        value={appointment.status} 
        onValueChange={updateStatus}
        disabled={loading}
      >
        <SelectTrigger className={cn(isMobile ? "w-full" : "w-32")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", status.color.split(' ')[0])} />
                {status.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Contact Buttons */}
      {appointment.client_phone && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={openWhatsApp}
            className="text-green-600 hover:text-green-700"
          >
            <MessageSquare className="w-4 h-4" />
            {!isMobile && <span className="ml-2">WhatsApp</span>}
          </Button>

          <Button
            variant="outline" 
            size="sm"
            onClick={makeCall}
            className="text-blue-600 hover:text-blue-700"
          >
            <Phone className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Ligar</span>}
          </Button>
        </>
      )}

      {/* Custom Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit3 className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Mensagem</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Mensagem</DialogTitle>
            <DialogDescription>
              Envie uma mensagem personalizada para {appointment.client_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message-type">Modelo</Label>
              <Select value={messageType} onValueChange={(value) => {
                setMessageType(value as keyof typeof MESSAGE_TEMPLATES);
                setCustomMessage(MESSAGE_TEMPLATES[value as keyof typeof MESSAGE_TEMPLATES]
                  .replace('{client_name}', appointment.client_name)
                  .replace('{service_name}', appointment.services?.name || 'serviço')
                  .replace('{date}', new Date(appointment.scheduled_at).toLocaleDateString('pt-BR'))
                  .replace('{time}', new Date(appointment.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
                );
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="confirmed">Confirmação</SelectItem>
                  <SelectItem value="cancelled">Cancelamento</SelectItem>
                  <SelectItem value="completed">Finalização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-message">Mensagem</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={sendCustomMessage} disabled={!customMessage.trim()}>
                Enviar via WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Appointment */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Remover</span>}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <Label htmlFor="cancellation-reason">Motivo da remoção (opcional)</Label>
            <Textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Digite o motivo da remoção..."
              rows={3}
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteAppointment}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};