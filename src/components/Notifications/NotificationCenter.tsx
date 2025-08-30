import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  AlertTriangle,
  Trash2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'new_appointment' | 'appointment_completed' | 'appointment_cancelled' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  appointment_id?: string;
  client_name?: string;
}

const NotificationCenter = () => {
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      // In a real app, you would have a notifications table
      // For now, we'll simulate notifications based on recent appointments
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name),
          users!professional_id (full_name)
        `)
        .eq(
          currentUser.role === 'professional' ? 'professional_id' : 'organization_id',
          currentUser.role === 'professional' ? currentUser.id : currentUser.organization_id
        )
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Convert appointments to notifications
      const notificationList: Notification[] = [];
      
      appointments?.forEach((appointment) => {
        const createdAt = new Date(appointment.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        // Only create notifications for recent appointments (last 48 hours)
        if (hoursDiff <= 48) {
          if (appointment.status === 'scheduled') {
            notificationList.push({
              id: `new_${appointment.id}`,
              type: 'new_appointment',
              title: 'Novo Agendamento',
              message: `${appointment.client_name} agendou ${appointment.services?.name || 'um serviço'}`,
              read: false,
              created_at: appointment.created_at,
              appointment_id: appointment.id,
              client_name: appointment.client_name
            });
          } else if (appointment.status === 'completed') {
            notificationList.push({
              id: `completed_${appointment.id}`,
              type: 'appointment_completed',
              title: 'Agendamento Concluído',
              message: `Atendimento de ${appointment.client_name} foi finalizado`,
              read: false,
              created_at: appointment.updated_at,
              appointment_id: appointment.id,
              client_name: appointment.client_name
            });
          } else if (appointment.status === 'cancelled') {
            notificationList.push({
              id: `cancelled_${appointment.id}`,
              type: 'appointment_cancelled',
              title: 'Agendamento Cancelado',
              message: `${appointment.client_name} cancelou o agendamento`,
              read: false,
              created_at: appointment.updated_at,
              appointment_id: appointment.id,
              client_name: appointment.client_name
            });
          }
        }
      });

      // Add system notifications
      notificationList.push({
        id: 'welcome',
        type: 'system',
        title: 'Bem-vindo ao Sistema!',
        message: 'Explore todas as funcionalidades disponíveis',
        read: false,
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      });

      setNotifications(notificationList.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      
      setUnreadCount(notificationList.filter(n => !n.read).length);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUser) return;

    // Subscribe to real-time updates for appointments
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: currentUser.role === 'professional' 
            ? `professional_id=eq.${currentUser.id}`
            : `organization_id=eq.${currentUser.organization_id}`
        },
        (payload) => {
          // Add new notification for new appointment
          const newNotification: Notification = {
            id: `new_${payload.new.id}`,
            type: 'new_appointment',
            title: 'Novo Agendamento',
            message: `${payload.new.client_name} fez um novo agendamento`,
            read: false,
            created_at: payload.new.created_at,
            appointment_id: payload.new.id,
            client_name: payload.new.client_name
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast({
            title: 'Novo Agendamento',
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: currentUser.role === 'professional' 
            ? `professional_id=eq.${currentUser.id}`
            : `organization_id=eq.${currentUser.organization_id}`
        },
        (payload) => {
          // Add notification for status changes
          if (payload.old.status !== payload.new.status) {
            let notificationType: Notification['type'] = 'system';
            let title = 'Status Atualizado';
            
            if (payload.new.status === 'completed') {
              notificationType = 'appointment_completed';
              title = 'Agendamento Concluído';
            } else if (payload.new.status === 'cancelled') {
              notificationType = 'appointment_cancelled';
              title = 'Agendamento Cancelado';
            }

            const statusNotification: Notification = {
              id: `status_${payload.new.id}_${Date.now()}`,
              type: notificationType,
              title,
              message: `Status do agendamento de ${payload.new.client_name} foi alterado`,
              read: false,
              created_at: new Date().toISOString(),
              appointment_id: payload.new.id,
              client_name: payload.new.client_name
            };

            setNotifications(prev => [statusNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'appointment_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'appointment_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Marcar como lida
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                Você tem {unreadCount} notificação{unreadCount !== 1 ? 'ões' : ''} não lida{unreadCount !== 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div className={cn(
                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5 border-l-2 border-l-primary"
                      )}>
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className={cn(
                                  "text-sm font-medium text-foreground truncate",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </p>
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;