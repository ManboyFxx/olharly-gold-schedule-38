
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ClientFiltersProps {
  filters: {
    status: string;
    tags: string[];
    dateRange: string;
  };
  onChange: (filters: any) => void;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({ filters, onChange }) => {
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' }
  ];

  const tagOptions = ['VIP', 'Premium', 'Regular', 'Novo', 'Fidelizado'];

  const dateRangeOptions = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'last_30', label: 'Últimos 30 dias' },
    { value: 'last_90', label: 'Últimos 90 dias' },
    { value: 'last_year', label: 'Último ano' }
  ];

  const handleStatusChange = (status: string) => {
    onChange({ ...filters, status });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: newTags });
  };

  const handleDateRangeChange = (dateRange: string) => {
    onChange({ ...filters, dateRange });
  };

  const clearFilters = () => {
    onChange({ status: 'all', tags: [], dateRange: 'all' });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.tags.length > 0 || filters.dateRange !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-earth-800">Filtros</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-earth-500 hover:text-earth-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm font-medium text-earth-700 mb-2 block">Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.status === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(option.value)}
              className={filters.status === option.value 
                ? "bg-gold hover:bg-gold-600 text-earth-900" 
                : "border-sand-300 text-earth-700 hover:bg-sand-50"
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="text-sm font-medium text-earth-700 mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => (
            <Button
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagToggle(tag)}
              className={filters.tags.includes(tag)
                ? "bg-gold hover:bg-gold-600 text-earth-900" 
                : "border-sand-300 text-earth-700 hover:bg-sand-50"
              }
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="text-sm font-medium text-earth-700 mb-2 block">Período do último agendamento</label>
        <div className="flex flex-wrap gap-2">
          {dateRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.dateRange === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleDateRangeChange(option.value)}
              className={filters.dateRange === option.value 
                ? "bg-gold hover:bg-gold-600 text-earth-900" 
                : "border-sand-300 text-earth-700 hover:bg-sand-50"
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-sand-200">
          <p className="text-sm text-earth-600 mb-2">Filtros ativos:</p>
          <div className="flex flex-wrap gap-1">
            {filters.status !== 'all' && (
              <Badge className="bg-gold-100 text-gold-800">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
              </Badge>
            )}
            {filters.tags.map((tag) => (
              <Badge key={tag} className="bg-gold-100 text-gold-800">
                Tag: {tag}
              </Badge>
            ))}
            {filters.dateRange !== 'all' && (
              <Badge className="bg-gold-100 text-gold-800">
                Período: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFilters;
