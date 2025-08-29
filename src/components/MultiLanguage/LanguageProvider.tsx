import React, { createContext, useContext, useState } from 'react';

export type Language = 'pt-BR' | 'en-US';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  'pt-BR': {
    // Dashboard
    'dashboard.welcome': 'Bem-vinda, Maria! 👋',
    'dashboard.summary': 'Aqui está um resumo dos seus agendamentos hoje.',
    'dashboard.appointments_today': 'Agendamentos Hoje',
    'dashboard.active_clients': 'Clientes Ativos',
    'dashboard.attendance_rate': 'Taxa de Comparecimento',
    'dashboard.next_appointment': 'Próximo Atendimento',
    'dashboard.since_yesterday': 'desde ontem',
    'dashboard.this_month': 'este mês',
    
    // Quick Actions
    'quick_actions.title': 'Ações Rápidas',
    'quick_actions.new_appointment': 'Novo Agendamento',
    'quick_actions.schedule_for_client': 'Agendar para cliente',
    'quick_actions.view_calendar': 'Ver Agenda',
    'quick_actions.view_schedule': 'Visualizar horários',
    'quick_actions.share_link': 'Compartilhar Link',
    'quick_actions.send_to_clients': 'Enviar para clientes',
    'quick_actions.manage_clients': 'Gerenciar Clientes',
    'quick_actions.records_and_history': 'Cadastros e histórico',
    
    // Recent Bookings
    'recent_bookings.title': 'Próximos Agendamentos',
    'recent_bookings.confirmed': 'Confirmado',
    'recent_bookings.pending': 'Pendente',
    'recent_bookings.cancelled': 'Cancelado',
    
    // Auth
    'auth.login': 'Faça seu login',
    'auth.signup': 'Crie sua conta',
    'auth.login_description': 'Acesse sua conta para gerenciar seus agendamentos',
    'auth.signup_description': 'Comece a usar o sistema de agendamento mais inteligente',
    'auth.full_name': 'Nome completo',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.enter': 'Entrar',
    'auth.create_account': 'Criar conta',
    'auth.no_account': 'Não tem uma conta? Cadastre-se',
    'auth.has_account': 'Já tem uma conta? Faça login',
    'auth.back_to_home': 'Voltar para o início',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.description': 'Gerencie as configurações da sua organização e personalize sua marca.',
    'settings.theme_brand': 'Tema & Marca',
    'settings.domain': 'Domínio',
    'settings.users': 'Usuários',
    'settings.notifications': 'Notificações',
  },
  
  'en-US': {
    // Dashboard
    'dashboard.welcome': 'Welcome, Maria! 👋',
    'dashboard.summary': 'Here\'s a summary of your appointments today.',
    'dashboard.appointments_today': 'Appointments Today',
    'dashboard.active_clients': 'Active Clients',
    'dashboard.attendance_rate': 'Attendance Rate',
    'dashboard.next_appointment': 'Next Appointment',
    'dashboard.since_yesterday': 'since yesterday',
    'dashboard.this_month': 'this month',
    
    // Quick Actions
    'quick_actions.title': 'Quick Actions',
    'quick_actions.new_appointment': 'New Appointment',
    'quick_actions.schedule_for_client': 'Schedule for client',
    'quick_actions.view_calendar': 'View Calendar',
    'quick_actions.view_schedule': 'View schedules',
    'quick_actions.share_link': 'Share Link',
    'quick_actions.send_to_clients': 'Send to clients',
    'quick_actions.manage_clients': 'Manage Clients',
    'quick_actions.records_and_history': 'Records and history',
    
    // Recent Bookings
    'recent_bookings.title': 'Upcoming Appointments',
    'recent_bookings.confirmed': 'Confirmed',
    'recent_bookings.pending': 'Pending',
    'recent_bookings.cancelled': 'Cancelled',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Create Account',
    'auth.login_description': 'Access your account to manage your appointments',
    'auth.signup_description': 'Start using the smartest appointment system',
    'auth.full_name': 'Full name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.enter': 'Sign In',
    'auth.create_account': 'Create Account',
    'auth.no_account': 'Don\'t have an account? Sign up',
    'auth.has_account': 'Already have an account? Sign in',
    'auth.back_to_home': 'Back to home',
    
    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Manage your organization settings and customize your brand.',
    'settings.theme_brand': 'Theme & Brand',
    'settings.domain': 'Domain',
    'settings.users': 'Users',
    'settings.notifications': 'Notifications',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt-BR');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};