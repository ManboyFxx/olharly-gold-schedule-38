import React, { useState } from 'react';
import { Plus, Calendar, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FABAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  color?: string;
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const actions: FABAction[] = [
    {
      icon: Calendar,
      label: 'Novo Agendamento',
      action: () => {
        navigate('/calendar');
        setIsOpen(false);
      }
    },
    {
      icon: UserPlus,
      label: 'Novo Cliente',
      action: () => {
        navigate('/clients?action=new');
        setIsOpen(false);
      }
    }
  ];

  const toggleFAB = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Action buttons */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200",
                  `animation-delay-${index * 50}`
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[#E8E4E0]">
                  <span className="text-sm font-medium text-[#2A2621] whitespace-nowrap">
                    {action.label}
                  </span>
                </div>
                <button
                  onClick={action.action}
                  className={cn(
                    "w-12 h-12 rounded-full shadow-lg transition-all duration-200",
                    "bg-[#E6B800] hover:bg-[#E6B800]/90 active:scale-95",
                    "flex items-center justify-center"
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Main FAB */}
      <button
        onClick={toggleFAB}
        className={cn(
          "fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          "bg-[#E6B800] hover:bg-[#E6B800]/90 active:scale-95",
          "flex items-center justify-center",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}

export default FloatingActionButton;