import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTimeOff } from '@/hooks/useTimeOff';
import { Plus, Edit, Trash2, Calendar, CalendarX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TimeOffFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
}

export const TimeOffManager = () => {
  const { timeOff, loading, createTimeOff, updateTimeOff, deleteTimeOff, getActiveTimeOff, getUpcomingTimeOff } = useTimeOff();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<string | null>(null);
  const [formData, setFormData] = useState<TimeOffFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_recurring: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTimeOff) {
      await updateTimeOff(editingTimeOff, formData);
    } else {
      await createTimeOff(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      is_recurring: false,
    });
    setEditingTimeOff(null);
  };

  const handleEdit = (timeOffItem: any) => {
    setFormData({
      title: timeOffItem.title,
      description: timeOffItem.description || '',
      start_date: timeOffItem.start_date,
      end_date: timeOffItem.end_date,
      is_recurring: timeOffItem.is_recurring,
    });
    setEditingTimeOff(timeOffItem.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (timeOffId: string) => {
    if (confirm('Tem certeza que deseja remover este período de folga?')) {
      await deleteTimeOff(timeOffId);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (startDate: string, endDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const todayDate = new Date(today);

    if (todayDate >= start && todayDate <= end) {
      return <Badge variant="destructive">Ativo</Badge>;
    } else if (todayDate < start) {
      return <Badge variant="outline">Futuro</Badge>;
    } else {
      return <Badge variant="secondary">Passado</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Carregando períodos de folga...
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeTimeOff = getActiveTimeOff();
  const upcomingTimeOff = getUpcomingTimeOff();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarX className="h-5 w-5" />
          Períodos de Folga
        </CardTitle>
        <CardDescription>
          Gerencie seus períodos de indisponibilidade como férias, feriados ou folgas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Período de Folga
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTimeOff ? 'Editar Período de Folga' : 'Adicionar Período de Folga'}
              </DialogTitle>
              <DialogDescription>
                Configure um período em que você não estará disponível para atendimentos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Férias, Feriado, Compromisso pessoal"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Detalhes adicionais sobre o período de folga"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTimeOff ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Active Time Off */}
        {activeTimeOff.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-destructive uppercase tracking-wide">
              Períodos Ativos
            </h3>
            {activeTimeOff.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {getStatusBadge(item.start_date, item.end_date)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.start_date)} até {formatDate(item.end_date)}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Time Off */}
        {upcomingTimeOff.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Próximos Períodos
            </h3>
            {upcomingTimeOff.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {getStatusBadge(item.start_date, item.end_date)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.start_date)} até {formatDate(item.end_date)}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Time Off - only show last 5 */}
        {timeOff.filter(item => new Date(item.end_date) < new Date()).slice(0, 5).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Períodos Anteriores
            </h3>
            {timeOff
              .filter(item => new Date(item.end_date) < new Date())
              .slice(0, 5)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg opacity-60"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {getStatusBadge(item.start_date, item.end_date)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.start_date)} até {formatDate(item.end_date)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        {timeOff.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Nenhum período de folga configurado</h3>
            <p className="text-sm">
              Configure períodos de indisponibilidade como férias ou feriados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};