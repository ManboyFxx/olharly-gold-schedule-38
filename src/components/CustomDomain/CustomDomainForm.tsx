
import React, { useState, useEffect } from 'react';
import { getDomainInfo } from '@/lib/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle, Globe, Copy, Lock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

interface CustomDomainFormProps {
  currentSlug?: string;
  onSlugUpdate: (slug: string) => void;
}

const CustomDomainForm: React.FC<CustomDomainFormProps> = ({ 
  currentSlug = '', 
  onSlugUpdate 
}) => {
  const { organization, updateOrganization } = useOrganization();
  const [slug, setSlug] = useState(currentSlug || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Se já tem slug definido, é imutável
  const isSlugLocked = Boolean(currentSlug);

  const validateSlug = (value: string): string => {
    if (!value) return 'Nome é obrigatório';
    if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    if (value.length > 30) return 'Nome deve ter no máximo 30 caracteres';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Use apenas letras minúsculas, números e hífens (sem espaços)';
    }
    if (value.startsWith('-') || value.endsWith('-')) {
      return 'Nome não pode começar ou terminar com hífen';
    }
    return '';
  };

  const checkAvailability = async (slugValue: string) => {
    if (slugValue === currentSlug) {
      setIsAvailable(true);
      return;
    }

    setIsChecking(true);
    // Simular verificação de disponibilidade (em produção, seria uma chamada à API)
    setTimeout(() => {
      const unavailableNames = ['admin', 'api', 'www', 'app', 'dashboard', 'sistema'];
      setIsAvailable(!unavailableNames.includes(slugValue.toLowerCase()));
      setIsChecking(false);
    }, 800);
  };

  useEffect(() => {
    if (isSlugLocked) return; // Não validar se está bloqueado

    const error = validateSlug(slug);
    setValidationError(error);
    
    if (!error && slug !== currentSlug) {
      const timeoutId = setTimeout(() => {
        checkAvailability(slug);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
    }
  }, [slug, currentSlug, isSlugLocked]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSlugLocked) return; // Não permitir mudanças se bloqueado
    
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
  };

  const handleSave = async () => {
    if (validationError || !isAvailable || isSlugLocked) return;
    
    setIsSaving(true);
    try {
      if (organization) {
        // Atualiza apenas o slug, mantendo o nome da organização inalterado
        const result = await updateOrganization({ slug });
        if (result.error) {
          throw result.error;
        }
        onSlugUpdate(slug);
        const domainInfo = getDomainInfo();
        toast({
          title: "Domínio definido com sucesso!",
          description: `Seu endereço exclusivo é: ${domainInfo.hostname}/${slug}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar domínio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    const domainInfo = getDomainInfo();
    const url = `${domainInfo.hostname}/${slug || currentSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copiado!',
        description: 'URL copiada para a área de transferência.',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a URL.',
        variant: 'destructive',
      });
    }
  };

  const openLink = () => {
    const domainInfo = getDomainInfo();
    const url = `${domainInfo.baseUrl}/${slug || currentSlug}`;
    window.open(url, '_blank');
  };

  const getStatusIcon = () => {
    if (isSlugLocked) return <Lock className="w-4 h-4 text-green-600" />;
    if (isChecking) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    if (validationError) return <XCircle className="w-4 h-4 text-red-500" />;
    if (isAvailable === true) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (isAvailable === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getStatusMessage = () => {
    if (isSlugLocked) return 'Seu domínio foi definido permanentemente';
    if (isChecking) return 'Verificando disponibilidade...';
    if (validationError) return validationError;
    if (isAvailable === true && slug !== currentSlug) return 'Nome disponível!';
    if (isAvailable === false) return 'Este nome já está em uso';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Formulário Principal */}
      <Card className="card-elegant">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {isSlugLocked ? 'Seu Domínio Exclusivo' : 'Defina seu Domínio Exclusivo'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSlugLocked 
                  ? 'Seu endereço de agendamento:'
                  : 'Escolha um nome único que represente sua marca (não poderá ser alterado depois)'
                }
              </p>
            </div>
          </div>
          {isSlugLocked && (
            <Button
              onClick={openLink}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Link</span>
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain-slug" className="text-sm font-medium text-foreground">
              Nome do seu espaço profissional
            </Label>
            <div className="relative flex items-center border rounded-lg overflow-hidden">
              <span className="absolute left-3 text-sm text-muted-foreground font-mono z-10">
                {getDomainInfo().hostname}/
              </span>
              <Input
                id="domain-slug"
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="seunome"
                className={`border-0 rounded-none focus:ring-0 focus:border-0 pl-32 pr-10 font-mono ${
                  isSlugLocked ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''
                }`}
                maxLength={30}
                disabled={isSlugLocked}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
            
            {/* Status da validação */}
            <div className="min-h-[20px]">
              {getStatusMessage() && (
                <p className={`text-xs flex items-center space-x-1 ${
                  isSlugLocked
                    ? 'text-green-600'
                    : validationError || isAvailable === false 
                      ? 'text-red-600' 
                      : isAvailable === true 
                        ? 'text-green-600' 
                        : 'text-muted-foreground'
                }`}>
                  <span>{getStatusMessage()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Dicas de uso - apenas se não estiver bloqueado */}
          {!isSlugLocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">⚠️ Importante - Escolha com cuidado:</p>
                  <ul className="text-amber-700 space-y-1 text-xs">
                    <li>• Este será seu endereço <strong>permanente</strong> e não poderá ser alterado</li>
                    <li>• Use seu nome profissional ou o nome do seu espaço</li>
                    <li>• Mantenha curto e fácil de lembrar</li>
                    <li>• Exemplo: "drajulia" → {getDomainInfo().hostname}/drajulia</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Preview da URL */}
      {(slug || currentSlug) && (
        <Card className="card-elegant border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {isSlugLocked ? 'Seu endereço ativo' : 'Preview do seu endereço'}
              </h4>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-background px-3 py-2 rounded border font-mono text-primary">
                  {getDomainInfo().hostname}/{slug || currentSlug}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Botão de salvar - apenas se não estiver bloqueado */}
      {!isSlugLocked && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!!validationError || isAvailable !== true || isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Definindo...
              </>
            ) : (
              'Definir Domínio Permanentemente'
            )}
          </Button>
        </div>
      )}

      {/* Aviso sobre domínio bloqueado */}
      {isSlugLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-1">Domínio Ativo e Protegido</p>
              <p className="text-green-700 text-xs">
                Seu domínio está funcionando perfeitamente. Por segurança e consistência, 
                não é possível alterá-lo após a definição inicial.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDomainForm;
