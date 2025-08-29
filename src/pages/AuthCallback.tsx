import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Aguardar a sessão ser estabelecida
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Buscar dados do usuário para determinar o redirecionamento
          const { data: userData, error } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
            navigate('/auth');
            return;
          }

          // Redirecionar com base no papel do usuário
          if (userData.role === 'professional') {
            toast({
              title: 'Login realizado com sucesso!',
              description: `Bem-vindo de volta, ${userData.full_name}`,
            });
            navigate('/professional-calendar');
          } else {
            toast({
              title: 'Login realizado com sucesso!',
              description: `Bem-vindo de volta, ${userData.full_name}`,
            });
            navigate('/dashboard');
          }
        } else {
          // Não há sessão, redirecionar para auth
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast({
          title: 'Erro no login',
          description: 'Ocorreu um erro ao processar seu login. Tente novamente.',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processando seu login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;