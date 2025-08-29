import React from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import AppointmentCalendar from '@/components/Calendar/AppointmentCalendar';
import { Calendar as CalendarIcon } from 'lucide-react';

const Calendar = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-display-md font-bold text-foreground mb-2 flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-primary" />
            Agenda
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus agendamentos e visualize sua agenda completa.
          </p>
        </div>

        {/* Calendar Component */}
        <AppointmentCalendar />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;