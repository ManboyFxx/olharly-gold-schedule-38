import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Clock, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  last_appointment?: string;
  appointment_count?: number;
}

interface WhatsAppManagerProps {
  client: Client;
  isMobile?: boolean;
}

const MESSAGE_TEMPLATES = {
  appointment_reminder: `Olá {name}! Lembrando do seu agendamento para amanhã. Confirme sua presença! 📅`,
  follow_up: `Olá {name}! Como foi sua experiência conosco? Adoraríamos ouvir seu feedback! ⭐`,
  promotional: `Olá {name}! Temos uma promoção especial para você. Entre em contato para saber mais! 🎉`,
  birthday: `Parabéns {name}! Feliz aniversário! 🎂 Temos um desconto especial para você no seu mês de aniversário!`,
  comeback: `Olá {name}! Sentimos sua falta! Que tal agendar um novo atendimento? Entre em contato conosco! ❤️`,
  thank_you: `Olá {name}! Obrigado por escolher nossos serviços. Foi um prazer atendê-lo! 🙏`,
  custom: ''
};

const TEMPLATE_LABELS = {
  appointment_reminder: 'Lembrete de Agendamento',
  follow_up: 'Follow-up Pós-Atendimento',
  promotional: 'Mensagem Promocional',
  birthday: 'Feliz Aniversário',
  comeback: 'Retorno de Cliente',
  thank_you: 'Agradecimento',
  custom: 'Mensagem Personalizada'
};

export const WhatsAppManager: React.FC<WhatsAppManagerProps> = ({
  client,
  isMobile = false
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof MESSAGE_TEMPLATES>('appointment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState<Array<{
    id: string;
    template: string;
    message: string;
    sent_at: string;
  }>>([]);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!client.phone) {
      toast({
        title: 'Erro',
        description: 'Cliente não possui telefone cadastrado',
        variant: 'destructive',
      });
      return;
    }

    const template = selectedTemplate === 'custom' ? customMessage : MESSAGE_TEMPLATES[selectedTemplate];
    const finalMessage = template.replace('{name}', client.full_name);

    if (!finalMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Mensagem não pode estar vazia',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Here you would integrate with WhatsApp Business API
      // For now, we'll open WhatsApp Web with the pre-filled message
      const phone = client.phone.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(finalMessage);
      window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');

      // Save message to history (in a real app, this would be saved to database)
      const newMessage = {
        id: Date.now().toString(),
        template: TEMPLATE_LABELS[selectedTemplate],
        message: finalMessage,
        sent_at: new Date().toISOString()
      };
      setMessageHistory(prev => [newMessage, ...prev]);

      toast({
        title: 'Mensagem enviada',
        description: 'WhatsApp foi aberto com a mensagem',
      });

      setShowDialog(false);
      setCustomMessage('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    }
  };

  const getClientSegment = () => {
    const appointmentCount = client.appointment_count || 0;
    const lastAppointment = client.last_appointment ? new Date(client.last_appointment) : null;
    const daysSinceLastAppointment = lastAppointment ? 
      Math.floor((Date.now() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24)) : null;

    if (appointmentCount === 0) return { segment: 'Novo', color: 'bg-blue-100 text-blue-800' };
    if (appointmentCount >= 10) return { segment: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (daysSinceLastAppointment && daysSinceLastAppointment > 90) {
      return { segment: 'Inativo', color: 'bg-gray-100 text-gray-800' };
    }
    if (appointmentCount >= 5) return { segment: 'Fiel', color: 'bg-green-100 text-green-800' };
    return { segment: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
  };

  const clientSegment = getClientSegment();

  return (
    <div className="space-y-4">
      {/* Client Info and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{client.full_name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", clientSegment.color)}>
                {clientSegment.segment}
              </Badge>
              {client.appointment_count && (
                <span className="text-xs text-muted-foreground">
                  {client.appointment_count} agendamentos
                </span>
              )}
            </div>
          </div>
        </div>

        {client.phone && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const phone = client.phone!.replace(/\D/g, '');
                window.open(`https://wa.me/55${phone}`, '_blank');
              }}
              className="text-green-600 hover:text-green-700"
            >
              <MessageSquare className="w-4 h-4" />
              {!isMobile && <span className="ml-2">WhatsApp</span>}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Send className="w-4 h-4" />
                  {!isMobile && <span className="ml-2">Enviar</span>}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Enviar Mensagem WhatsApp</DialogTitle>
                  <DialogDescription>
                    Escolha um modelo ou escreva uma mensagem personalizada para {client.full_name}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Modelo de Mensagem</Label>
                    <Select value={selectedTemplate} onValueChange={(value) => {
                      setSelectedTemplate(value as keyof typeof MESSAGE_TEMPLATES);
                      if (value !== 'custom') {
                        setCustomMessage(MESSAGE_TEMPLATES[value as keyof typeof MESSAGE_TEMPLATES]
                          .replace('{name}', client.full_name)
                        );
                      } else {
                        setCustomMessage('');
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={selectedTemplate === 'custom' ? customMessage : 
                        MESSAGE_TEMPLATES[selectedTemplate].replace('{name}', client.full_name)
                      }
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      rows={4}
                      disabled={selectedTemplate !== 'custom'}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={sendMessage} className="bg-green-600 hover:bg-green-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Enviar WhatsApp
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Message History */}
      {messageHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Histórico de Mensagens</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messageHistory.map((msg) => (
              <div key={msg.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-green-600">{msg.template}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.sent_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-muted-foreground">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <div className="flex items-center justify-center">
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-lg font-semibold text-foreground">{client.appointment_count || 0}</div>
          <div className="text-xs text-muted-foreground">Agendamentos</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-lg font-semibold text-foreground">
            {client.last_appointment ? 
              Math.floor((Date.now() - new Date(client.last_appointment).getTime()) / (1000 * 60 * 60 * 24))
              : '-'
            }
          </div>
          <div className="text-xs text-muted-foreground">Dias desde último</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-lg font-semibold text-foreground">{messageHistory.length}</div>
          <div className="text-xs text-muted-foreground">Mensagens</div>
        </div>
      </div>
    </div>
  );
};