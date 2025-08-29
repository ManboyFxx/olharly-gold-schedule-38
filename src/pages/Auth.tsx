import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isProfessional, setIsProfessional] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Atualizar senha quando modo profissional muda
  React.useEffect(() => {
    if (isProfessional) {
      setFormData(prev => ({ ...prev, password: 'souprofissional' }));
    } else {
      setFormData(prev => ({ ...prev, password: '' }));
    }
  }, [isProfessional]);
  
  const { signIn, signUp, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Se marcou como profissional, fazer login simplificado apenas com email
        if (isProfessional) {
          const { data: professionalExists, error: checkError } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', formData.email)
            .eq('role', 'professional')
            .single();

          if (checkError || !professionalExists) {
            toast({
              title: 'Acesso negado',
              description: 'Este email não está cadastrado como profissional. Entre em contato com o administrador.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }

          // Para profissionais, fazer login direto com senha padrão
          const { error: signInError } = await signIn(formData.email, 'souprofissional');
          
          if (signInError) {
            toast({
              title: 'Erro no login',
              description: 'Não foi possível fazer login. Verifique se o email está correto.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login realizado com sucesso!',
              description: 'Bem-vindo ao painel profissional',
            });
          }
        } else {
          // Login normal para administradores
          const { error } = await signIn(formData.email, formData.password);
          if (error) {
            toast({
              title: 'Erro no login',
              description: error.message === 'Invalid login credentials' 
                ? 'Email ou senha incorretos' 
                : 'Erro ao fazer login. Tente novamente.',
              variant: 'destructive',
            });
          } else {
            // O redirecionamento será feito pelo AuthProvider baseado no role
            toast({
              title: 'Login realizado com sucesso!',
              description: 'Bem-vindo de volta ao Olharly',
            });
          }
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Email já cadastrado',
              description: 'Este email já está em uso. Faça login ou use outro email.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Erro no cadastro',
              description: 'Erro ao criar conta. Tente novamente.',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Conta criada com sucesso!',
            description: 'Bem-vindo ao Olharly! Sua conta foi criada.',
          });
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetProfessionalPassword = async () => {
    if (!formData.email) {
      toast({
        title: 'Email obrigatório',
        description: 'Digite seu email para resetar a senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.functions.invoke('reset-professional-password', {
        body: { email: formData.email }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Senha resetada!',
        description: 'Sua senha foi resetada para a senha padrão. Tente fazer login novamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao resetar senha',
        description: error.message || 'Não foi possível resetar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex items-center justify-center",
      isMobile ? "p-4" : "p-8"
    )}>
      <div className={cn(
        "w-full max-w-md",
        isMobile ? "space-y-6" : "space-y-8"
      )}>
        {/* Header */}
        <div className="text-center">
          <div className={cn(
            "flex items-center justify-center space-x-3",
            isMobile ? "mb-4" : "mb-6"
          )}>
            <div className={cn(
              "bg-primary rounded-lg flex items-center justify-center",
              isMobile ? "w-10 h-10" : "w-12 h-12"
            )}>
              <img 
                src="/images/OY.png" 
                alt="Olharly Logo" 
                className={cn(
                  "object-contain",
                  isMobile ? "w-6 h-6" : "w-7 h-7"
                )}
              />
            </div>
            <div>
              <h1 className={cn(
                "font-bold text-foreground",
                isMobile ? "text-xl" : "text-2xl"
              )}>Olharly</h1>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>Agendamento Inteligente</p>
            </div>
          </div>
          
          <h2 className={cn(
            "font-semibold text-foreground",
            isMobile ? "text-xl" : "text-display-sm"
          )}>
            {isLogin ? 'Faça seu login' : 'Crie sua conta'}
          </h2>
          <p className={cn(
            "text-muted-foreground mt-2",
            isMobile ? "text-sm" : "text-base"
          )}>
            {isLogin 
              ? 'Acesse sua conta para gerenciar seus agendamentos' 
              : 'Comece a usar o sistema de agendamento mais inteligente'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="card-elegant">
          <form onSubmit={handleSubmit} className={cn(
            isMobile ? "space-y-4" : "space-y-6"
          )}>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={!isLogin}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-elegant"
                  placeholder="Digite seu nome completo"
                />
              </div>
            )}
            
            {isLogin && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="professional"
                    checked={isProfessional}
                    onChange={(e) => setIsProfessional(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="professional" className="text-sm">
                    Sou profissional
                  </Label>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-elegant"
                placeholder="Digite seu email"
              />
            </div>

            {/* Campo de senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                disabled={isProfessional}
                placeholder={isProfessional ? "Senha padrão preenchida automaticamente" : "Digite sua senha"}
                required={!isProfessional}
                value={formData.password}
                onChange={handleInputChange}
                className="input-elegant"
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-gold" 
              disabled={loading}
            >
              {loading 
                ? (isLogin ? 'Entrando...' : 'Criando conta...')
                : (isLogin ? 'Entrar' : 'Criar conta')
              }
            </Button>

            {/* Botão para resetar senha de profissional */}
            {isLogin && isProfessional && (
              <Button 
                type="button"
                variant="outline"
                className="w-full" 
                disabled={isResettingPassword}
                onClick={handleResetProfessionalPassword}
              >
                {isResettingPassword ? 'Resetando...' : 'Esqueci minha senha'}
              </Button>
            )}
          </form>

          <div className={cn(
            "text-center",
            isMobile ? "mt-4" : "mt-6"
          )}>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className={cn(
                "text-primary hover:text-primary/80 font-medium transition-colors",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se' 
                : 'Já tem uma conta? Faça login'
              }
            </button>
          </div>
        </Card>

        {/* Back to home */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;