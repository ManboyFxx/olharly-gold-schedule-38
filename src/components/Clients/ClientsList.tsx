
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Calendar,
  Users
} from 'lucide-react';
import ClientFilters from './ClientFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from '@/hooks/use-toast';

interface ClientsListProps {
  onViewProfile: (clientId: string) => void;
  onEditClient: (clientId: string) => void;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  tags: string[];
  lastAppointment?: string;
  totalAppointments: number;
  avatar?: string;
}

const ClientsList: React.FC<ClientsListProps> = ({ onViewProfile, onEditClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    tags: [],
    dateRange: 'all'
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      fetchClients();
    }
  }, [currentUser]);

  const fetchClients = async () => {
    if (!currentUser) return;
    
    try {
      // Buscar todos os agendamentos únicos por cliente para esta organização
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('client_name, client_email, client_phone, scheduled_at, status')
        .eq('organization_id', currentUser.organization_id)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar clientes',
          variant: 'destructive',
        });
        return;
      }

      // Agrupar por cliente e calcular estatísticas
      const clientsMap = new Map<string, Client>();
      
      appointments?.forEach(appointment => {
        const clientKey = appointment.client_email || appointment.client_name;
        
        if (!clientsMap.has(clientKey)) {
          clientsMap.set(clientKey, {
            id: clientKey,
            name: appointment.client_name,
            email: appointment.client_email || '',
            phone: appointment.client_phone || '',
            status: 'active',
            tags: [],
            totalAppointments: 0,
            lastAppointment: undefined,
          });
        }
        
        const client = clientsMap.get(clientKey)!;
        client.totalAppointments++;
        
        // Atualizar último agendamento
        if (!client.lastAppointment || new Date(appointment.scheduled_at) > new Date(client.lastAppointment)) {
          client.lastAppointment = appointment.scheduled_at;
        }
        
        // Determinar status baseado na atividade recente
        const lastAppointmentDate = new Date(client.lastAppointment!);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        client.status = lastAppointmentDate > thirtyDaysAgo ? 'active' : 'inactive';
        
        // Adicionar tags baseadas no número de agendamentos
        client.tags = [];
        if (client.totalAppointments >= 10) {
          client.tags.push('Fidelizado');
        }
        if (client.totalAppointments >= 20) {
          client.tags.push('VIP');
        }
        if (client.totalAppointments <= 3) {
          client.tags.push('Novo');
        }
      });
      
      setClients(Array.from(clientsMap.values()));
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
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
      {/* Search and Filters */}
      <Card className="border-sand-200 shadow-soft">
        <CardContent className={cn(
          "p-6",
          isMobile && "p-4"
        )}>
          <div className={cn(
            "flex gap-4",
            isMobile ? "flex-col" : "flex-col md:flex-row"
          )}>
            <div className="flex-1 relative">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-400",
                isMobile ? "w-5 h-5" : "w-4 h-4"
              )} />
              <Input
                placeholder={isMobile ? "Buscar cliente..." : "Buscar por nome, email ou telefone..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "border-sand-300 focus:border-gold focus:ring-gold/20",
                  isMobile ? "pl-12 h-12 text-base" : "pl-10"
                )}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "border-sand-300 text-earth-700 hover:bg-sand-50",
                isMobile && "h-12 w-full"
              )}
            >
              <Filter className={cn(
                "mr-2",
                isMobile ? "w-5 h-5" : "w-4 h-4"
              )} />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-sand-200">
              <ClientFilters filters={filters} onChange={setFilters} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className={cn(
          "text-earth-600 flex items-center",
          isMobile && "text-sm"
        )}>
          <Users className={cn(
            "mr-2",
            isMobile ? "w-4 h-4" : "w-4 h-4"
          )} />
          {filteredClients.length} clientes encontrados
        </p>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
        {filteredClients.map((client) => (
          <Card key={client.id} className="border-sand-200 shadow-soft hover:shadow-lg transition-shadow">
            <CardHeader className={cn(
              "pb-3",
              isMobile && "pb-2 px-4 pt-4"
            )}>
              <div className="flex items-start justify-between">
                <div className={cn(
                  "flex items-center space-x-3",
                  isMobile && "space-x-2"
                )}>
                  <div className={cn(
                    "bg-gold-100 rounded-full flex items-center justify-center",
                    isMobile ? "w-10 h-10" : "w-12 h-12"
                  )}>
                    <span className={cn(
                      "text-gold-800 font-semibold",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className={cn(
                      "text-earth-900",
                      isMobile ? "text-base" : "text-lg"
                    )}>{client.name}</CardTitle>
                    <Badge className={cn(
                      `mt-1 ${getStatusColor(client.status)}`,
                      isMobile && "text-xs"
                    )}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className={cn(
              "space-y-4",
              isMobile && "space-y-3 px-4 pb-4"
            )}>
              <div className={cn(
                "space-y-2",
                isMobile && "space-y-1"
              )}>
                <div className={cn(
                  "flex items-center text-earth-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Mail className={cn(
                    "mr-2",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  {isMobile ? client.email.length > 20 ? client.email.substring(0, 20) + '...' : client.email : client.email}
                </div>
                <div className={cn(
                  "flex items-center text-earth-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Phone className={cn(
                    "mr-2",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  {client.phone}
                </div>
                <div className={cn(
                  "flex items-center text-earth-600",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  <Calendar className={cn(
                    "mr-2",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  {client.totalAppointments} agendamentos
                </div>
              </div>

              {/* Tags */}
              <div className={cn(
                "flex flex-wrap gap-1",
                isMobile && "gap-1"
              )}>
                {client.tags.map((tag) => (
                  <Badge key={tag} className={cn(
                    `${getTagColor(tag)}`,
                    isMobile ? "text-xs px-2 py-0.5" : "text-xs"
                  )}>
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className={cn(
                "flex space-x-2 pt-2",
                isMobile && "space-x-2 pt-1"
              )}>
                <Button
                  size={isMobile ? "sm" : "sm"}
                  variant="outline"
                  onClick={() => onViewProfile(client.id)}
                  className={cn(
                    "flex-1 border-sand-300 text-earth-700 hover:bg-sand-50",
                    isMobile && "h-9 text-xs"
                  )}
                >
                  <Eye className={cn(
                    "mr-1",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  {isMobile ? "Ver" : "Ver Perfil"}
                </Button>
                <Button
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => onEditClient(client.id)}
                  className={cn(
                    "flex-1 bg-gold hover:bg-gold-600 text-earth-900",
                    isMobile && "h-9 text-xs"
                  )}
                >
                  <Edit className={cn(
                    "mr-1",
                    isMobile ? "w-3 h-3" : "w-4 h-4"
                  )} />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {filteredClients.length === 0 && (
        <Card className="border-sand-200 shadow-soft">
          <CardContent className={cn(
            "text-center",
            isMobile ? "p-8" : "p-12"
          )}>
            <Users className={cn(
              "text-earth-300 mx-auto mb-4",
              isMobile ? "w-12 h-12" : "w-16 h-16"
            )} />
            <h3 className={cn(
              "font-semibold text-earth-700 mb-2",
              isMobile ? "text-base" : "text-lg"
            )}>
              Nenhum cliente encontrado
            </h3>
            <p className={cn(
              "text-earth-500",
              isMobile && "text-sm"
            )}>
              Tente ajustar os filtros ou criar um novo cliente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientsList;
