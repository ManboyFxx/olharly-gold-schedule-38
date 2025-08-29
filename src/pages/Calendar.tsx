import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import AppointmentCalendar from '@/components/Calendar/AppointmentCalendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Calendar = () => {
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-6" : "space-y-8"
      )}>
        {/* Header */}
        <div>
          <h1 className={cn(
            "font-bold text-foreground mb-2 flex items-center",
            isMobile ? "text-2xl" : "text-display-md"
          )}>
            <CalendarIcon className={cn(
              "mr-3 text-primary",
              isMobile ? "w-6 h-6" : "w-8 h-8"
            )} />
            Agenda
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-base" : "text-lg"
          )}>
            Gerencie seus agendamentos e visualize sua agenda completa.
          </p>
        </div>

        {/* Calendar Component */}
        <AppointmentCalendar />
      </div>
    </AppLayout>
  );
};

export default Calendar;