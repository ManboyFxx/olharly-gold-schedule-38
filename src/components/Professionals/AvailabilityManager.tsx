import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useAvailability';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

interface AvailabilityFormData {
  day_of_week: number | null;
  start_time: string;
  end_time: string;
}

export const AvailabilityManager = () => {
  const { availability, loading, createAvailabilitySlot, updateAvailabilitySlot, deleteAvailabilitySlot } = useAvailability();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState<AvailabilityFormData>({
    day_of_week: null,
    start_time: '09:00',
    end_time: '18:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.day_of_week === null) return;

    if (editingSlot) {
      await updateAvailabilitySlot(editingSlot, formData);
    } else {
      await createAvailabilitySlot(formData as { day_of_week: number; start_time: string; end_time: string });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      day_of_week: null,
      start_time: '09:00',
      end_time: '18:00',
    });
    setEditingSlot(null);
  };

  const handleEdit = (slot: any) => {
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
    });
    setEditingSlot(slot.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (slotId: string) => {
    if (confirm('Tem certeza que deseja remover este horário?')) {
      await deleteAvailabilitySlot(slotId);
    }
  };

  const getAvailabilityByDay = () => {
    const grouped: { [key: number]: any[] } = {};
    availability.forEach(slot => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = [];
      }
      grouped[slot.day_of_week].push(slot);
    });
    return grouped;
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds if present
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Carregando horários de funcionamento...
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedAvailability = getAvailabilityByDay();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários de Funcionamento
        </CardTitle>
        <CardDescription>
          Configure os dias e horários em que você está disponível para atendimentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Horário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? 'Editar Horário' : 'Adicionar Horário'}
              </DialogTitle>
              <DialogDescription>
                Configure o dia da semana e os horários de funcionamento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="day_of_week">Dia da Semana</Label>
                <Select
                  value={formData.day_of_week?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Horário de Início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">Horário de Fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSlot ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {DAYS_OF_WEEK.map((day) => (
          <div key={day.value} className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {day.label}
            </h3>
            {groupedAvailability[day.value]?.length > 0 ? (
              <div className="space-y-2">
                {groupedAvailability[day.value].map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </Badge>
                      {!slot.is_active && (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Nenhum horário configurado
              </div>
            )}
          </div>
        ))}

        {availability.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Nenhum horário configurado</h3>
            <p className="text-sm">
              Configure seus horários de funcionamento para que os clientes possam agendar consultas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};