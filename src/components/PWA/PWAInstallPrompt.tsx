
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className={cn(
      "fixed z-50 bg-card border border-border shadow-lg rounded-lg p-4",
      isMobile 
        ? "bottom-20 left-4 right-4" 
        : "top-4 right-4 w-80"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">O</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Instalar Olharly</h3>
            <p className="text-sm text-muted-foreground">Acesso rápido na tela inicial</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleInstall}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Instalar
        </Button>
        <Button
          variant="outline"
          onClick={handleDismiss}
          size="sm"
        >
          Depois
        </Button>
      </div>
    </div>
  );
};
