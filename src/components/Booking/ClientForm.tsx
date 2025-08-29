
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientData) => void;
  onBack: () => void;
}

export const ClientForm = ({ onSubmit, onBack }: ClientFormProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchingClient, setSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome é obrigatório';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Email inválido';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Telefone é obrigatório';
    } else {
      // Accept various phone formats and validate length
      const cleanPhone = formData.clientPhone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        newErrors.clientPhone = 'Telefone inválido. Digite 10 ou 11 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
    if (cleaned.length >= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    if (cleaned.length >= 6 && cleaned.length < 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    setFormData(prev => ({ ...prev, clientPhone: formatted }));
    setClientFound(false);
  };

  const searchClientByPhone = async () => {
    const cleanPhone = formData.clientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return;

    setSearchingClient(true);
    try {
      const { data: client } = await supabase
        .from('users')
        .select('full_name, email, phone')
        .eq('role', 'client')
        .ilike('phone', `%${cleanPhone.slice(-9)}%`)
        .limit(1)
        .single();

      if (client) {
        setFormData({
          clientName: client.full_name,
          clientEmail: client.email,
          clientPhone: formData.clientPhone
        });
        setClientFound(true);
        toast({
          title: 'Cliente encontrado!',
          description: `Dados de ${client.full_name} preenchidos automaticamente.`
        });
      } else {
        setClientFound(false);
        toast({
          title: 'Cliente não encontrado',
          description: 'Nenhum cliente encontrado com este número. Preencha os dados normalmente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error searching client:', error);
    } finally {
      setSearchingClient(false);
    }
  };

  useEffect(() => {
    const cleanPhone = formData.clientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 11 || cleanPhone.length === 10) {
      searchClientByPhone();
    }
  }, [formData.clientPhone]);

  return (
    <div className={cn(
      "bg-white border border-[#E8E4E0]",
      isMobile ? "min-h-screen p-4" : "max-w-md mx-auto rounded-2xl shadow-xl p-8"
    )}>
      <div className={cn(
        "text-center",
        isMobile ? "mb-6" : "mb-8"
      )}>
        <div className={cn(
          "bg-[#E6B800]/10 rounded-full flex items-center justify-center mx-auto mb-4",
          isMobile ? "w-12 h-12" : "w-16 h-16"
        )}>
          <User className={cn(
            "text-[#E6B800]",
            isMobile ? "w-6 h-6" : "w-8 h-8"
          )} />
        </div>
        <h2 className={cn(
          "font-bold text-[#2A2621] mb-2",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          Seus Dados
        </h2>
        <p className={cn(
          "text-[#8B7355]",
          isMobile ? "text-sm" : ""
        )}>
          Precisamos de algumas informações para confirmar seu agendamento
        </p>
      </div>

      <form onSubmit={handleSubmit} className={cn(
        "space-y-6",
        isMobile ? "pb-20" : ""
      )}>
        <div className="space-y-2">
          <Label htmlFor="name" className={cn(
            "text-[#2A2621] font-medium",
            isMobile ? "text-base" : ""
          )}>
            Nome Completo
          </Label>
          <div className="relative">
            <User className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2A2621]/50",
              isMobile ? "w-5 h-5" : "w-4 h-4"
            )} />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className={cn(
                "border-[#E8E4E0] focus:border-[#E6B800] focus:ring-[#E6B800] rounded-xl transition-all duration-200",
                isMobile ? "pl-12 h-12 text-base" : "pl-10",
                errors.clientName ? 'border-red-500' : ''
              )}
            />
          </div>
          {errors.clientName && (
            <p className="text-red-500 text-sm">{errors.clientName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={cn(
            "text-[#2A2621] font-medium",
            isMobile ? "text-base" : ""
          )}>
            E-mail
          </Label>
          <div className="relative">
            <Mail className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2A2621]/50",
              isMobile ? "w-5 h-5" : "w-4 h-4"
            )} />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className={cn(
                "border-[#E8E4E0] focus:border-[#E6B800] focus:ring-[#E6B800] rounded-xl transition-all duration-200",
                isMobile ? "pl-12 h-12 text-base" : "pl-10",
                errors.clientEmail ? 'border-red-500' : ''
              )}
            />
          </div>
          {errors.clientEmail && (
            <p className="text-red-500 text-sm">{errors.clientEmail}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={cn(
            "text-[#2A2621] font-medium",
            isMobile ? "text-base" : ""
          )}>
            Telefone
          </Label>
          <div className="relative">
            <Phone className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2A2621]/50",
              isMobile ? "w-5 h-5" : "w-4 h-4"
            )} />
            {searchingClient && (
              <Search className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E6B800] animate-spin",
                isMobile ? "w-5 h-5" : "w-4 h-4"
              )} />
            )}
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.clientPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={15}
              className={cn(
                "border-[#E8E4E0] focus:border-[#E6B800] focus:ring-[#E6B800] rounded-xl transition-all duration-200",
                isMobile ? "pl-12 h-12 text-base" : "pl-10",
                searchingClient ? "pr-12" : "",
                clientFound ? "border-green-500 bg-green-50" : "",
                errors.clientPhone ? 'border-red-500' : ''
              )}
            />
          </div>
          {clientFound && (
            <p className="text-green-600 text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente encontrado! Dados preenchidos automaticamente.
            </p>
          )}
          {errors.clientPhone && (
            <p className="text-red-500 text-sm">{errors.clientPhone}</p>
          )}
        </div>

        <div className={cn(
          "flex gap-3 pt-4",
          isMobile ? "fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4E0] p-4" : ""
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className={cn(
              "flex-1 border-[#E8E4E0] text-[#8B7355] hover:bg-[#F5F2ED] rounded-xl shadow-md hover:shadow-lg transition-all duration-200",
              isMobile ? "h-12 text-base" : ""
            )}
          >
            <ArrowLeft className={cn(
              "mr-2",
              isMobile ? "w-5 h-5" : "w-4 h-4"
            )} />
            Voltar
          </Button>
          
          <Button
            type="submit"
            className={cn(
              "flex-1 bg-[#E6B800] hover:bg-[#D4A700] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200",
              isMobile ? "h-12 text-base" : ""
            )}
          >
            Continuar
            <ArrowRight className={cn(
              "ml-2",
              isMobile ? "w-5 h-5" : "w-4 h-4"
            )} />
          </Button>
        </div>
      </form>
    </div>
  );
};
