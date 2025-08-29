import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PermissionGate } from '@/components/PermissionGate';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock, 
  Users, 
  Calendar,
  Settings,
  Zap,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  id?: string;
  organization_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  reminder_hours_before: number;
  confirmation_enabled: boolean;
  cancellation_enabled: boolean;
  no_show_tracking: boolean;
  custom_email_template: string;
  custom_sms_template: string;
  notification_sender_name: string;
  notification_sender_email: string;
  whatsapp_api_key?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: Partial<NotificationSettings> = {
  email_notifications: true,
  sms_notifications: false,
  whatsapp_notifications: false,
  reminder_hours_before: 24,
  confirmation_enabled: true,
  cancellation_enabled: true,
  no_show_tracking: false,
  custom_email_template: `Olá {cliente_nome},

Este é um lembrete de que você tem um agendamento marcado:

🗓️ Data: {data_agendamento}
⏰ Horário: {horario_agendamento}
👤 Profissional: {profissional_nome}
📍 Local: {endereco_organizacao}

Se precisar cancelar ou reagendar, entre em contato conosco.

Atenciosamente,
{nome_organizacao}`,
  custom_sms_template: 'Lembrete: Você tem agendamento em {data_agendamento} às {horario_agendamento} com {profissional_nome}. {nome_organizacao}',
  notification_sender_name: '',
  notification_sender_email: '',
};

const NotificationSettings = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  // Fetch notification settings
  const { data: notificationSettings, isLoading } = useQuery({
    queryKey: ['notification-settings', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      
      const { data, error } = await (supabase as any)
        .from('notification_settings')
        .select('*')
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationSettings | null;
    },
    enabled: !!organization?.id,
  });

  // Initialize settings
  useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    } else if (organization?.id) {
      setSettings({
        ...DEFAULT_SETTINGS,
        organization_id: organization.id,
        notification_sender_name: organization.name || '',
        notification_sender_email: organization.email || '',
      } as NotificationSettings);
    }
  }, [notificationSettings, organization]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      if (!organization?.id) throw new Error('Organization not found');
      
      const { data, error } = await (supabase as any)
        .from('notification_settings')
        .upsert({
          ...newSettings,
          organization_id: organization.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', organization?.id] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de notificação foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSaveSettings = () => {
    if (settings) {
      saveSettingsMutation.mutate(settings);
    }
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card className="card-elegant">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Canais de Notificação</h3>
            <p className="text-sm text-muted-foreground">Configure como enviar lembretes aos clientes</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-base font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">Enviar lembretes por email</p>
              </div>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(value) => updateSetting('email_notifications', value)}
            />
          </div>

          {/* SMS Notifications */}
          <PermissionGate
            permission="hasMultipleUsers"
            feature="Notificações SMS"
            fallback={
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium text-muted-foreground">SMS</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes por SMS</p>
                    <div className="flex items-center mt-1">
                      <Crown className="w-3 h-3 mr-1" />
                      <span className="text-xs">Disponível no plano Posicionado(a)</span>
                    </div>
                  </div>
                </div>
                <Switch disabled />
              </div>
            }
          >
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-medium">SMS</Label>
                  <p className="text-sm text-muted-foreground">Enviar lembretes por SMS</p>
                </div>
              </div>
              <Switch
                checked={settings.sms_notifications}
                onCheckedChange={(value) => updateSetting('sms_notifications', value)}
              />
            </div>
          </PermissionGate>

          {/* WhatsApp Notifications */}
          <PermissionGate
            permission="hasWhatsAppIntegration"
            feature="Notificações WhatsApp"
            fallback={
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium text-muted-foreground">WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes pelo WhatsApp</p>
                    <div className="flex items-center mt-1">
                      <Crown className="w-3 h-3 mr-1" />
                      <span className="text-xs">Disponível no plano Posicionado(a)</span>
                    </div>
                  </div>
                </div>
                <Switch disabled />
              </div>
            }
          >
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-medium">WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Enviar lembretes pelo WhatsApp</p>
                </div>
              </div>
              <Switch
                checked={settings.whatsapp_notifications}
                onCheckedChange={(value) => updateSetting('whatsapp_notifications', value)}
              />
            </div>
          </PermissionGate>
        </div>
      </Card>

      {/* Timing and Behavior */}
      <Card className="card-elegant">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Configurações de Tempo</h3>
            <p className="text-sm text-muted-foreground">Quando enviar notificações</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reminder_hours">Lembrete (horas antes do agendamento)</Label>
            <Select 
              value={settings.reminder_hours_before.toString()} 
              onValueChange={(value) => updateSetting('reminder_hours_before', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hora antes</SelectItem>
                <SelectItem value="2">2 horas antes</SelectItem>
                <SelectItem value="4">4 horas antes</SelectItem>
                <SelectItem value="12">12 horas antes</SelectItem>
                <SelectItem value="24">24 horas antes</SelectItem>
                <SelectItem value="48">48 horas antes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Confirmar agendamentos</Label>
              <Switch
                checked={settings.confirmation_enabled}
                onCheckedChange={(value) => updateSetting('confirmation_enabled', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificar cancelamentos</Label>
              <Switch
                checked={settings.cancellation_enabled}
                onCheckedChange={(value) => updateSetting('cancellation_enabled', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Rastrear faltas</Label>
              <Switch
                checked={settings.no_show_tracking}
                onCheckedChange={(value) => updateSetting('no_show_tracking', value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Sender Information */}
      <Card className="card-elegant">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Informações do Remetente</h3>
            <p className="text-sm text-muted-foreground">Como aparecer nas notificações</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sender_name">Nome do Remetente</Label>
            <Input
              id="sender_name"
              value={settings.notification_sender_name}
              onChange={(e) => updateSetting('notification_sender_name', e.target.value)}
              placeholder="Nome da sua empresa"
            />
          </div>
          <div>
            <Label htmlFor="sender_email">Email do Remetente</Label>
            <Input
              id="sender_email"
              type="email"
              value={settings.notification_sender_email}
              onChange={(e) => updateSetting('notification_sender_email', e.target.value)}
              placeholder="noreply@suaempresa.com"
            />
          </div>
        </div>
      </Card>

      {/* Templates */}
      <Card className="card-elegant">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Templates de Mensagem</h3>
            <p className="text-sm text-muted-foreground">Personalize o conteúdo das notificações</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="email_template">Template de Email</Label>
            <Textarea
              id="email_template"
              value={settings.custom_email_template}
              onChange={(e) => updateSetting('custom_email_template', e.target.value)}
              rows={8}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Variáveis disponíveis: {'{cliente_nome}'}, {'{data_agendamento}'}, {'{horario_agendamento}'}, {'{profissional_nome}'}, {'{nome_organizacao}'}, {'{endereco_organizacao}'}
            </p>
          </div>

          <div>
            <Label htmlFor="sms_template">Template de SMS</Label>
            <Textarea
              id="sms_template"
              value={settings.custom_sms_template}
              onChange={(e) => updateSetting('custom_sms_template', e.target.value)}
              rows={3}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              SMS deve ser conciso (máximo 160 caracteres recomendado)
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="min-w-[120px]"
        >
          {saveSettingsMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;