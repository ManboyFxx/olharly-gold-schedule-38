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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  
  const { signIn, signInWithMagicLink, signUp } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        if (useMagicLink) {
          const { error } = await signInWithMagicLink(formData.email);
          if (error) {
            toast({
              title: 'Erro no envio do link',
              description: error.message === 'User not found' 
                ? 'Email não encontrado. Entre em contato com a administradora do espaço.' 
                : 'Erro ao enviar link de acesso. Tente novamente.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Link de acesso enviado!',
              description: 'Verifique seu email e clique no link para acessar seu painel.',
            });
          }
        } else {
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
                    id="magicLink"
                    checked={useMagicLink}
                    onChange={(e) => setUseMagicLink(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="magicLink" className="text-sm">
                    Sou profissional - Receber link por email
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

            {!useMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!useMagicLink}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-elegant"
                  placeholder="Digite sua senha"
                  minLength={6}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full btn-gold" 
              disabled={loading}
            >
              {loading 
                ? (isLogin 
                    ? (useMagicLink ? 'Enviando link...' : 'Entrando...') 
                    : 'Criando conta...'
                  ) 
                : (isLogin 
                    ? (useMagicLink ? 'Enviar link de acesso' : 'Entrar') 
                    : 'Criar conta'
                  )
              }
            </Button>
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