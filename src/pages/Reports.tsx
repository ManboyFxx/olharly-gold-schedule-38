import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Download,
  Lock,
  Crown
} from 'lucide-react';

interface ReportData {
  appointmentsByMonth: any[];
  appointmentsByService: any[];
  appointmentsByStatus: any[];
  monthlyRevenue: any[];
  topClients: any[];
  professionalPerformance: any[];
}

const Reports = () => {
  const { permissions, currentPlan, checkPermission } = usePermissions();
  const { organization } = useOrganization();
  const isMobile = useIsMobile();
  const [reportData, setReportData] = useState<ReportData>({
    appointmentsByMonth: [],
    appointmentsByService: [],
    appointmentsByStatus: [],
    monthlyRevenue: [],
    topClients: [],
    professionalPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  const hasAdvancedReports = checkPermission('hasAdvancedReports');
  const canExportData = checkPermission('canExportData');

  useEffect(() => {
    if (organization?.id) {
      fetchReportData();
    }
  }, [organization?.id, selectedPeriod]);

  const fetchReportData = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      // Get appointments for the selected period
      const monthsAgo = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsAgo);

      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_id (name, price_cents),
          users:professional_id (full_name)
        `)
        .eq('organization_id', organization.id)
        .gte('scheduled_at', startDate.toISOString());

      if (appointments) {
        // Process data for different chart types
        const processedData = processAppointmentData(appointments);
        setReportData(processedData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAppointmentData = (appointments: any[]): ReportData => {
    // Basic stats available for all plans
    const basicData = {
      appointmentsByMonth: processMonthlyData(appointments),
      appointmentsByStatus: processStatusData(appointments),
      appointmentsByService: processServiceData(appointments),
      monthlyRevenue: [],
      topClients: [],
      professionalPerformance: []
    };

    // Advanced stats only for plans with advanced reports
    if (hasAdvancedReports) {
      basicData.monthlyRevenue = processRevenueData(appointments);
      basicData.topClients = processClientsData(appointments);
      basicData.professionalPerformance = processProfessionalData(appointments);
    }

    return basicData;
  };

  const processMonthlyData = (appointments: any[]) => {
    const monthlyCount = appointments.reduce((acc, apt) => {
      const month = new Date(apt.scheduled_at).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyCount).map(([month, count]) => ({
      month,
      appointments: count
    }));
  };

  const processStatusData = (appointments: any[]) => {
    const statusCount = appointments.reduce((acc, apt) => {
      const status = apt.status === 'scheduled' ? 'Agendado' : 
                   apt.status === 'completed' ? 'Concluído' :
                   apt.status === 'cancelled' ? 'Cancelado' : 'Outros';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#E6B800', '#4CAF50', '#F44336', '#9E9E9E'];
    return Object.entries(statusCount).map(([status, value], index) => ({
      name: status,
      value,
      color: colors[index]
    }));
  };

  const processServiceData = (appointments: any[]) => {
    const serviceCount = appointments.reduce((acc, apt) => {
      const serviceName = apt.services?.name || 'Serviço não identificado';
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceCount)
      .map(([service, count]) => ({ service, appointments: count as number }))
      .sort((a, b) => (b.appointments as number) - (a.appointments as number))
      .slice(0, 5);
  };

  const processRevenueData = (appointments: any[]) => {
    const revenueByMonth = appointments
      .filter(apt => apt.status === 'completed' && apt.services?.price_cents)
      .reduce((acc, apt) => {
        const month = new Date(apt.scheduled_at).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
        acc[month] = (acc[month] || 0) + ((apt.services?.price_cents || 0) / 100);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }));
  };

  const processClientsData = (appointments: any[]) => {
    const clientCount = appointments.reduce((acc, apt) => {
      const clientName = apt.client_name || 'Cliente não identificado';
      acc[clientName] = (acc[clientName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(clientCount)
      .map(([client, appointments]) => ({ client, appointments: appointments as number }))
      .sort((a, b) => (b.appointments as number) - (a.appointments as number))
      .slice(0, 10);
  };

  const processProfessionalData = (appointments: any[]) => {
    const professionalStats = appointments.reduce((acc, apt) => {
      const professionalName = apt.users?.full_name || 'Profissional não identificado';
      if (!acc[professionalName]) {
        acc[professionalName] = { appointments: 0, revenue: 0 };
      }
      acc[professionalName].appointments += 1;
      if (apt.status === 'completed' && apt.services?.price_cents) {
        acc[professionalName].revenue += (apt.services?.price_cents || 0) / 100;
      }
      return acc;
    }, {} as Record<string, { appointments: number; revenue: number }>);

    return Object.entries(professionalStats).map(([professional, stats]) => ({
      professional,
      appointments: (stats as { appointments: number; revenue: number }).appointments,
      revenue: (stats as { appointments: number; revenue: number }).revenue
    }));
  };

  const exportData = () => {
    if (!canExportData) return;
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `relatorio-${organization?.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const UpgradePrompt = ({ title }: { title: string }) => (
    <Card className="border-dashed border-2 border-gold/30">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4">
          {currentPlan === 'conhecendo' ? <Crown className="w-8 h-8 text-gold" /> : <Lock className="w-8 h-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">
          {currentPlan === 'conhecendo' 
            ? 'Este recurso estará disponível quando você assinar um plano.' 
            : 'Faça upgrade para o plano Posicionado(a) para acessar este recurso.'}
        </p>
        <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
          Ver Planos
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className={cn("space-y-6", isMobile && "px-4")}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl" : "text-3xl"
            )}>
              Relatórios
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={currentPlan === 'posicionado' ? 'default' : 'secondary'}>
                Plano {currentPlan === 'conhecendo' ? 'Trial' : 
                       currentPlan === 'comecei_agora' ? 'Comecei Agora' : 'Posicionado(a)'}
              </Badge>
              {hasAdvancedReports && (
                <Badge variant="outline" className="text-gold border-gold">
                  Relatórios Avançados
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="12m">1 ano</SelectItem>
              </SelectContent>
            </Select>
            
            {canExportData && (
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Basic Reports - Available for all plans */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold" />
                    Agendamentos por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.appointmentsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#E6B800" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold" />
                    Status dos Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.appointmentsByStatus}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {reportData.appointmentsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Reports - Only for plans with advanced reports */}
            <div className="grid gap-6 md:grid-cols-2">
              {hasAdvancedReports ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gold" />
                        Receita Mensal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reportData.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                            <Line type="monotone" dataKey="revenue" stroke="#E6B800" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gold" />
                        Top Clientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reportData.topClients.slice(0, 5).map((client: any, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{client.client}</span>
                            <Badge variant="outline">{client.appointments} agendamentos</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <UpgradePrompt title="Relatório de Receita" />
                  <UpgradePrompt title="Análise de Clientes" />
                </>
              )}
            </div>

            {/* Additional Advanced Features */}
            <div className="grid gap-6">
              {hasAdvancedReports ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance por Profissional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.professionalPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="professional" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="appointments" fill="#E6B800" name="Agendamentos" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <UpgradePrompt title="Performance Detalhada por Profissional" />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;