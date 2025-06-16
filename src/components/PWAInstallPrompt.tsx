
import React, { useState, useEffect } from 'react';
import { Download, X, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend Navigator interface to include iOS Safari's standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verifica se foi dispensado permanentemente
    const wasPermanentlyDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasPermanentlyDismissed) {
      setDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('PWA install prompt event captured');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
    const isPWA = navigatorWithStandalone.standalone || isStandalone;
    
    if (isPWA) {
      console.log('PWA already installed');
      return;
    }

    // Para dispositivos iOS/Safari que não suportam beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS || isSafari) {
      console.log('iOS/Safari detected - showing install prompt');
      setShowPrompt(true);
    }

    // Sempre mostrar após 1 segundo se não foi dispensado
    const timer = setTimeout(() => {
      console.log('Force showing PWA prompt after timeout');
      setShowPrompt(true);
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Para iOS Safari - mostrar instruções
      alert('Para instalar este app:\n1. Toque no botão compartilhar\n2. Selecione "Adicionar à Tela de Início"');
    }
  };

  const handlePermanentDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleTemporaryDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt || dismissed) {
    return null;
  }

  return (
    <Card className="mb-4 bg-gradient-to-r from-gray-100/90 via-white/95 to-gray-100/90 dark:from-gray-800/90 dark:via-gray-900/95 dark:to-gray-800/90 border-gray-300/60 dark:border-gray-600/60 backdrop-blur-md shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 rounded-lg shadow-md">
              <Download className="w-5 h-5 text-white dark:text-gray-800" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 mb-1">
                📱 Instalar App
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Acesse rapidamente e leia offline!
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Wifi className="w-4 h-4" />
                <span>Funciona sem internet.</span>
              </div>
            </div>
          </div>
          <button
            onClick={handlePermanentDismiss}
            className="h-8 w-8 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/70 dark:hover:bg-gray-600/70 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-300 dark:hover:to-gray-200 text-white dark:text-gray-800 text-sm h-9 shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleTemporaryDismiss}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-400/60 dark:border-gray-500/60 text-gray-800 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 text-sm h-9 bg-gray-100/40 dark:bg-gray-800/40"
          >
            Agora não
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
