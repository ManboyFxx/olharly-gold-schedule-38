import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
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
      <CardContent className={cn(
        "flex flex-col items-center justify-center text-center",
        isMobile ? "py-6 px-4" : "py-8"
      )}>
        <div className={cn(
          "bg-gold/10 rounded-full flex items-center justify-center mb-4",
          isMobile ? "w-12 h-12" : "w-16 h-16"
        )}>
          {currentPlan === 'conhecendo' ? (
            <Crown className={cn(
              "text-gold",
              isMobile ? "w-6 h-6" : "w-8 h-8"
            )} />
          ) : (
            <Lock className={cn(
              "text-muted-foreground",
              isMobile ? "w-6 h-6" : "w-8 h-8"
            )} />
          )}
        </div>
        <h3 className={cn(
          "font-semibold mb-2",
          isMobile ? "text-base" : "text-lg"
        )}>{title}</h3>
        <p className={cn(
          "text-muted-foreground mb-4",
          isMobile ? "text-xs" : "text-sm"
        )}>
          {currentPlan === 'conhecendo' 
            ? 'Este recurso estará disponível quando você assinar um plano.' 
            : 'Faça upgrade para o plano Posicionado(a) para acessar este recurso.'}
        </p>
        <Button 
          variant="outline" 
          className={cn(
            "border-gold text-gold hover:bg-gold hover:text-white",
            isMobile && "text-sm px-4 py-2"
          )}
        >
          Ver Planos
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className={cn("space-y-6", isMobile && "")}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between",
          isMobile && "flex-col items-start gap-4"
        )}>
          <div>
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl" : "text-3xl"
            )}>
              Relatórios
            </h1>
            <div className={cn(
              "flex items-center gap-2 mt-2",
              isMobile && "flex-wrap"
            )}>
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
          
          <div className={cn(
            "flex items-center gap-3",
            isMobile && "w-full flex-col gap-2"
          )}>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className={cn(
                "w-32",
                isMobile && "w-full"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="12m">1 ano</SelectItem>
              </SelectContent>
            </Select>
            
            {canExportData && (
              <Button variant="outline" onClick={exportData} className={cn(
                isMobile && "w-full"
              )}>
                <Download className={cn(
                  "w-4 h-4 mr-2",
                  isMobile && "w-5 h-5"
                )} />
                {isMobile ? "Exportar Dados" : "Exportar"}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1" : "md:grid-cols-2"
          )}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "bg-muted rounded animate-pulse",
                    isMobile ? "h-48" : "h-64"
                  )}></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Basic Reports - Available for all plans */}
            <div className={cn(
              "grid gap-6",
              isMobile ? "grid-cols-1" : "md:grid-cols-2"
            )}>
              <Card>
                <CardHeader className={cn(
                  isMobile && "pb-4"
                )}>
                  <CardTitle className={cn(
                    "flex items-center gap-2",
                    isMobile ? "text-lg" : "text-xl"
                  )}>
                    <Calendar className={cn(
                      "text-gold",
                      isMobile ? "w-4 h-4" : "w-5 h-5"
                    )} />
                    {isMobile ? "Agendamentos" : "Agendamentos por Mês"}
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn(
                  isMobile && "px-4 pb-4"
                )}>
                  <div className={cn(
                    isMobile ? "h-48" : "h-64"
                  )}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.appointmentsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
                        <YAxis fontSize={isMobile ? 10 : 12} />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#E6B800" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={cn(
                  isMobile && "pb-4"
                )}>
                  <CardTitle className={cn(
                    "flex items-center gap-2",
                    isMobile ? "text-lg" : "text-xl"
                  )}>
                    <Clock className={cn(
                      "text-gold",
                      isMobile ? "w-4 h-4" : "w-5 h-5"
                    )} />
                    {isMobile ? "Status" : "Status dos Agendamentos"}
                  </CardTitle>
                </CardHeader>
                <CardContent className={cn(
                  isMobile && "px-4 pb-4"
                )}>
                  <div className={cn(
                    isMobile ? "h-48" : "h-64"
                  )}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.appointmentsByStatus}
                          cx="50%"
                          cy="50%"
                          outerRadius={isMobile ? 60 : 80}
                          dataKey="value"
                          label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            <div className={cn(
              "grid gap-6",
              isMobile ? "grid-cols-1" : "md:grid-cols-2"
            )}>
              {hasAdvancedReports ? (
                <>
                  <Card>
                    <CardHeader className={cn(
                      isMobile && "pb-4"
                    )}>
                      <CardTitle className={cn(
                        "flex items-center gap-2",
                        isMobile ? "text-lg" : "text-xl"
                      )}>
                        <TrendingUp className={cn(
                          "text-gold",
                          isMobile ? "w-4 h-4" : "w-5 h-5"
                        )} />
                        {isMobile ? "Receita" : "Receita Mensal"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn(
                      isMobile && "px-4 pb-4"
                    )}>
                      <div className={cn(
                        isMobile ? "h-48" : "h-64"
                      )}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reportData.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
                            <YAxis fontSize={isMobile ? 10 : 12} />
                            <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                            <Line type="monotone" dataKey="revenue" stroke="#E6B800" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(
                      isMobile && "pb-4"
                    )}>
                      <CardTitle className={cn(
                        "flex items-center gap-2",
                        isMobile ? "text-lg" : "text-xl"
                      )}>
                        <Users className={cn(
                          "text-gold",
                          isMobile ? "w-4 h-4" : "w-5 h-5"
                        )} />
                        {isMobile ? "Top Clientes" : "Top Clientes"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn(
                      isMobile && "px-4 pb-4"
                    )}>
                      <div className="space-y-3">
                        {reportData.topClients.slice(0, 5).map((client: any, index) => (
                          <div key={index} className={cn(
                            "flex items-center justify-between",
                            isMobile && "text-sm"
                          )}>
                            <span className={cn(
                              "font-medium",
                              isMobile ? "text-sm" : "text-sm"
                            )}>{client.client}</span>
                            <Badge variant="outline" className={cn(
                              isMobile && "text-xs px-2 py-1"
                            )}>{client.appointments} agendamentos</Badge>
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
                  <CardHeader className={cn(
                    isMobile && "pb-4"
                  )}>
                    <CardTitle className={cn(
                      "flex items-center gap-2",
                      isMobile ? "text-lg" : "text-xl"
                    )}>
                      <Users className={cn(
                        "text-gold",
                        isMobile ? "w-4 h-4" : "w-5 h-5"
                      )} />
                      {isMobile ? "Performance" : "Performance por Profissional"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn(
                    isMobile && "px-4 pb-4"
                  )}>
                    <div className={cn(
                      isMobile ? "h-48" : "h-64"
                    )}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.professionalPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="professional" fontSize={isMobile ? 10 : 12} />
                          <YAxis fontSize={isMobile ? 10 : 12} />
                          <Tooltip />
                          <Bar dataKey="appointments" fill="#E6B800" name="Agendamentos" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <UpgradePrompt title={isMobile ? "Performance Detalhada" : "Performance Detalhada por Profissional"} />
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;