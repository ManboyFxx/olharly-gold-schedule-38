
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock,
  User,
  FileText,
  TrendingUp
} from 'lucide-react';
import ClientAppointmentHistory from './ClientAppointmentHistory';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ clientId, onBack, onEdit }) => {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui carregaria os dados do cliente do Supabase
    const loadClient = async () => {
      setLoading(true);
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      setClient({
        id: clientId,
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '(11) 99999-9999',
        birthDate: '1985-05-15',
        address: 'Rua das Flores, 123 - Jardim Paulista, São Paulo - SP, 01310-100',
        notes: 'Cliente preferencial, sempre pontual. Prefere horários pela manhã. Alérgica a produtos com parabenos.',
        tags: ['VIP', 'Regular', 'Pontual'],
        status: 'active',
        createdAt: '2023-01-15',
        totalAppointments: 25,
        lastAppointment: '2024-01-20',
        totalSpent: 2500.00,
        averageRating: 4.8
      });
      setLoading(false);
    };

    loadClient();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!client) {
    return <div>Cliente não encontrado</div>;
  }

  const getTagColor = (tag: string) => {
    const colors = {
      'VIP': 'bg-gold-100 text-gold-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Regular': 'bg-blue-100 text-blue-800',
      'Novo': 'bg-green-100 text-green-800',
      'Fidelizado': 'bg-orange-100 text-orange-800',
      'Pontual': 'bg-emerald-100 text-emerald-800'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-earth-600 hover:text-earth-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-earth-900">Perfil do Cliente</h2>
            <p className="text-earth-600">Informações detalhadas e histórico</p>
          </div>
        </div>
        <Button
          onClick={onEdit}
          className="bg-gold hover:bg-gold-600 text-earth-900 font-semibold"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Client Overview */}
      <Card className="border-sand-200 shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gold-100 rounded-full flex items-center justify-center">
              <span className="text-gold-800 font-bold text-2xl">
                {client.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-earth-900">{client.name}</h3>
                  <Badge className={`mt-1 ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-earth-500">Cliente desde</p>
                  <p className="font-semibold text-earth-800">{formatDate(client.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-earth-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{formatDate(client.birthDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-earth-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">São Paulo, SP</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag: string) => (
                  <Badge key={tag} className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Total de Agendamentos</p>
                <p className="text-2xl font-bold text-earth-900">{client.totalAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Último Agendamento</p>
                <p className="text-lg font-semibold text-earth-900">{formatDate(client.lastAppointment)}</p>
              </div>
              <Clock className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Total Gasto</p>
                <p className="text-xl font-bold text-earth-900">{formatCurrency(client.totalSpent)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-sand-200 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-earth-500">Avaliação Média</p>
                <p className="text-2xl font-bold text-earth-900">{client.averageRating}</p>
              </div>
              <div className="text-gold text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-sand-100">
          <TabsTrigger value="info" className="data-[state=active]:bg-gold data-[state=active]:text-earth-900">
            Informações
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gold data-[state=active]:text-earth-900">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-gold data-[state=active]:text-earth-900">
            Observações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="border-sand-200 shadow-soft">
            <CardHeader>
              <CardTitle className="text-earth-900">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-earth-700">Endereço Completo</label>
                  <p className="text-earth-900 mt-1">{client.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-earth-700">Data de Nascimento</label>
                  <p className="text-earth-900 mt-1">{formatDate(client.birthDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <ClientAppointmentHistory clientId={clientId} />
        </TabsContent>

        <TabsContent value="notes">
          <Card className="border-sand-200 shadow-soft">
            <CardHeader>
              <CardTitle className="text-earth-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-sand-50 p-4 rounded-lg">
                <p className="text-earth-800 leading-relaxed">
                  {client.notes || 'Nenhuma observação registrada para este cliente.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfile;
