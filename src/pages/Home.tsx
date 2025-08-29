import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Star, Check, ArrowRight, Zap, Shield, Palette, Phone, MapPin, FileText, Scissors, Sparkles, Heart, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Home = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className={cn("container-brand", isMobile && "px-4")}>
          <div className={cn("flex items-center justify-between", isMobile ? "h-14" : "h-16")}>
            <div className="flex items-center space-x-3">
              <div className={cn("bg-gold rounded-lg flex items-center justify-center overflow-hidden", isMobile ? "w-7 h-7" : "w-8 h-8")}>
                <img src="/images/OY.png" alt="Olharly Logo" className={cn("object-contain", isMobile ? "w-5 h-5" : "w-6 h-6")} />
              </div>
              <div>
                <h1 className={cn("font-bold text-foreground", isMobile ? "text-lg" : "text-xl")}>Olharly</h1>
                {!isMobile && <p className="text-xs text-muted-foreground">Agendamento para Beleza</p>}
              </div>
            </div>
            {!isMobile && (
              <nav className="hidden md:flex space-x-8">
                <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
                <a href="#vantagens" className="text-muted-foreground hover:text-foreground transition-colors">Vantagens</a>
                <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">Planos</a>
              </nav>
            )}
            <div className="flex items-center space-x-3">
              {user ? (
                <Link to="/dashboard">
                  <Button 
                    variant="default" 
                    className={cn(
                      "bg-gold hover:bg-gold-600 text-earth-900",
                      isMobile && "text-sm px-3 py-2"
                    )}
                  >
                    {isMobile ? "Painel" : "Ir para Painel"}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button 
                    variant="default" 
                    className={cn(
                      "bg-gold hover:bg-gold-600 text-earth-900",
                      isMobile && "text-sm px-3 py-2"
                    )}
                  >
                    {isMobile ? "Entrar" : "Começar Grátis"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={cn("section-padding", isMobile && "py-8")}>
        <div className={cn("container-brand", isMobile && "px-4")}>
          <div className={cn("text-center mx-auto animate-fade-in", isMobile ? "max-w-full" : "max-w-4xl")}>
            <div className={cn("flex justify-center", isMobile ? "mb-4" : "mb-6")}>
              <img 
                src="/images/OY.png" 
                alt="Olharly Logo" 
                className={cn("object-contain", isMobile ? "w-48 h-48" : "w-64 h-64")} 
              />
            </div>
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl mb-4" : "text-4xl md:text-6xl mb-6"
            )}>
              Transforme seu salão com{' '}
              <span className="text-gold">agendamento online</span>
            </h1>
            <p className={cn(
              "text-muted-foreground mx-auto",
              isMobile ? "text-base mb-6 max-w-full" : "text-xl mb-10 max-w-2xl"
            )}>
              Sistema completo de agendamento para barbearias, salões de beleza, estética e bem-estar. 
              Otimize sua agenda, reduza faltas e aumente sua receita.
            </p>
            <div className={cn(
              "flex gap-4 justify-center",
              isMobile ? "flex-col" : "flex-col sm:flex-row"
            )}>
              <Link to="/auth" className={isMobile ? "w-full" : ""}>
                <Button 
                  size={isMobile ? "default" : "lg"} 
                  className={cn(
                    "bg-gold hover:bg-gold-600 text-earth-900",
                    isMobile ? "w-full h-12" : "px-8"
                  )}
                >
                  Teste Grátis por 30 Dias <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/booking" className={isMobile ? "w-full" : ""}>
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"} 
                  className={cn(
                    isMobile ? "w-full h-12" : "px-8"
                  )}
                >
                  Ver Demo do Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className={cn("section-padding bg-warm-100", isMobile && "py-8")}>
        <div className={cn("container-brand", isMobile && "px-4")}>
          <div className={cn("text-center animate-slide-up", isMobile ? "mb-6" : "mb-12")}>
            <h2 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl mb-2" : "text-3xl md:text-4xl mb-4"
            )}>
              Tudo que seu salão precisa
            </h2>
            <p className={cn(
              "text-muted-foreground mx-auto",
              isMobile ? "text-base max-w-full" : "text-lg max-w-2xl"
            )}>
              Funcionalidades completas para barbearias, salões de beleza, estética e bem-estar
            </p>
          </div>
          
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1 mb-6" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8"
          )}>
            <Card className="card-elegant">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-lg mb-4">
                  <Calendar className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Agenda Online</h3>
                <p className="text-muted-foreground text-sm">
                  Seus clientes agendam sozinhos, 24 horas por dia. Visualize todos os horários em um calendário intuitivo.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-lg mb-4">
                  <Scissors className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Gestão de Serviços</h3>
                <p className="text-muted-foreground text-sm">
                  Cadastre cortes, coloração, sobrancelhas, cílios e todos os seus serviços com preços e durações.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-lg mb-4">
                  <Phone className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Lembretes Automáticos</h3>
                <p className="text-muted-foreground text-sm">
                  WhatsApp e SMS automáticos para lembrar os clientes. Reduza faltas em até 70%.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Múltiplos Profissionais</h3>
                <p className="text-muted-foreground text-sm">
                  Gerencie agendas de vários profissionais, cada um com seus horários e especialidades.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-lg mb-4">
                  <Sparkles className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Histórico de Clientes</h3>
                <p className="text-muted-foreground text-sm">
                  Acompanhe preferências, procedimentos realizados e histórico completo de cada cliente.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center justify-center w-12 h-12 bg-gold/10 rounded-lg mb-4">
                  <FileText className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Relatórios Financeiros</h3>
                <p className="text-muted-foreground text-sm">
                  Acompanhe receita, serviços mais procurados e desempenho do seu negócio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section id="vantagens" className={cn("section-padding", isMobile && "py-8")}>
        <div className={cn("container-brand", isMobile && "px-4")}>
          <div className={cn("text-center animate-slide-up", isMobile ? "mb-6" : "mb-12")}>
            <h2 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl mb-2" : "text-3xl md:text-4xl mb-4"
            )}>
              Por que salões escolhem o Olharly?
            </h2>
            <p className={cn(
              "text-muted-foreground mx-auto",
              isMobile ? "text-base max-w-full" : "text-lg max-w-2xl"
            )}>
              Resultados comprovados que fazem a diferença no seu faturamento
            </p>
          </div>
          
          <div className={cn(
            "grid gap-8",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-earth-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Mais Agendamentos</h3>
                  <p className="text-muted-foreground">
                    Clientes agendam a qualquer hora, aumentando sua ocupação e receita mensal.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-earth-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Menos Faltas</h3>
                  <p className="text-muted-foreground">
                    Sistema de lembretes reduz faltas em até 70%, otimizando sua agenda diária.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-earth-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Economiza Tempo</h3>
                  <p className="text-muted-foreground">
                    Pare de ficar no WhatsApp agendando. Automatize e foque no que faz melhor: atender.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-earth-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Profissional e Moderno</h3>
                  <p className="text-muted-foreground">
                    Seu salão com presença digital profissional que impressiona e gera confiança.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-earth-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Controle Total</h3>
                  <p className="text-muted-foreground">
                    Gerencie horários, bloqueios, serviços e preços de forma simples e intuitiva.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-earth-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Suporte Especializado</h3>
                  <p className="text-muted-foreground">
                    Equipe que entende o dia a dia de salões e está sempre pronta para ajudar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="planos" className={cn("section-padding bg-warm-100", isMobile && "py-8")}>
        <div className={cn("container-brand", isMobile && "px-4")}>
          <div className={cn("text-center animate-slide-up", isMobile ? "mb-6" : "mb-12")}>
            <h2 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-2xl mb-2" : "text-3xl md:text-4xl mb-4"
            )}>
              Planos para todo tipo de salão
            </h2>
            <p className={cn(
              "text-muted-foreground mx-auto",
              isMobile ? "text-base max-w-full" : "text-lg max-w-2xl"
            )}>
              Do profissional autônomo até grandes salões com várias cadeiras
            </p>
          </div>
          
          <div className={cn(
            "grid gap-6 max-w-6xl mx-auto",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
          )}>
            {/* Conhecendo Plan */}
            <Card className="card-elegant relative">
              <CardHeader className={cn("text-center", isMobile ? "p-4 pb-2" : "")}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className={cn("text-foreground mb-2", isMobile ? "text-lg" : "text-xl")}>
                  Conhecendo
                </CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  Experimente tudo
                </CardDescription>
                <div className="mb-6">
                  <span className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl")}>
                    Grátis
                  </span>
                  <span className="text-muted-foreground">
                    /3 dias
                  </span>
                </div>
              </CardHeader>
              <CardContent className={cn("space-y-3", isMobile ? "p-4 pt-2" : "")}>
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Todas as funcionalidades
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Todos os recursos
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Notificações (email + SMS)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Relatórios básicos
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Widget de agendamento
                    </span>
                  </li>
                </ul>
                <Link to="/auth" className="block">
                  <Button variant="outline" className={cn("w-full", isMobile ? "h-10 text-sm" : "")}>
                    Iniciar Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Comecei Agora Plan */}
            <Card className="card-elegant relative ring-2 ring-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className={cn("text-center", isMobile ? "p-4 pb-2" : "")}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className={cn("text-foreground mb-2", isMobile ? "text-lg" : "text-xl")}>
                  Comecei Agora
                </CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  Ideal para começar
                </CardDescription>
                <div className="mb-6">
                  <span className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl")}>
                    R$ 19,90
                  </span>
                  <span className="text-muted-foreground">
                    /mês
                  </span>
                </div>
              </CardHeader>
              <CardContent className={cn("space-y-3", isMobile ? "p-4 pt-2" : "")}>
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Até 100 agendamentos/mês
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      1 profissional
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Notificações por email
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Widget embutível
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Suporte padrão
                    </span>
                  </li>
                </ul>
                <Link to="/auth" className="block">
                  <Button className={cn("w-full", isMobile ? "h-10 text-sm" : "")}>
                    Assinar Plano
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Posicionado Plan */}
            <Card className="card-elegant relative">
              <CardHeader className={cn("text-center", isMobile ? "p-4 pb-2" : "")}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className={cn("text-foreground mb-2", isMobile ? "text-lg" : "text-xl")}>
                  Posicionado(a)
                </CardTitle>
                <CardDescription className="text-muted-foreground mb-4">
                  Tudo liberado para escalar
                </CardDescription>
                <div className="mb-6">
                  <span className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl")}>
                    R$ 49,90
                  </span>
                  <span className="text-muted-foreground">
                    /mês
                  </span>
                </div>
              </CardHeader>
              <CardContent className={cn("space-y-3", isMobile ? "p-4 pt-2" : "")}>
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Agendamentos ilimitados
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Múltiplos profissionais
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Email + SMS + WhatsApp
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Relatórios avançados
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Widget + domínio personalizado
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      App PWA instalável
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Integração WhatsApp + API
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Suporte prioritário 24/7
                    </span>
                  </li>
                </ul>
                <Link to="/auth" className="block">
                  <Button variant="outline" className={cn("w-full", isMobile ? "h-10 text-sm" : "")}>
                    Assinar Plano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto text-center mt-12">
            <h3 className={cn("font-semibold text-foreground mb-4", isMobile ? "text-lg" : "text-xl")}>
              Dúvidas Frequentes
            </h3>
            <div className="space-y-4 text-left">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Posso cancelar a qualquer momento?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Existe período de teste?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Oferecemos 3 dias grátis para você testar todas as funcionalidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn("bg-earth-900 text-warm-100", isMobile ? "py-8" : "section-padding")}>
        <div className={cn("container-brand", isMobile && "px-4")}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <img src="/images/OY.png" alt="Olharly Logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h1 className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>Olharly</h1>
                <p className={cn("text-warm-300", isMobile ? "text-xs" : "text-xs")}>Agendamento para Beleza</p>
              </div>
            </div>
            <p className={cn("text-warm-300 mb-6", isMobile ? "text-sm" : "")}>
              O sistema de agendamento que transforma salões em negócios mais organizados e lucrativos.
            </p>
            <Link to="/auth">
              <Button className={cn("bg-gold hover:bg-gold-600 text-earth-900", isMobile ? "w-full h-12" : "")}>
                Comece Seu Teste Grátis
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
