
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BookingNotFound = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
        </div>
        
        <div>
          <h1 className="text-2xl font-semibold text-[#2A2621] mb-2">
            Página não encontrada
          </h1>
          <p className="text-[#2A2621]/70">
            A página de agendamento que você está procurando não foi encontrada ou não está mais disponível.
          </p>
        </div>

        <Button
          onClick={() => window.location.href = '/'}
          className="bg-[#E6B800] hover:bg-[#E6B800]/90 text-white font-medium"
        >
          Ir para página inicial
        </Button>
      </div>
    </div>
  );
};
