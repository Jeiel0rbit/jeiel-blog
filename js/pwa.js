// PWA installation and management

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.dismissed = false;
        this.init();
    }

    init() {
        // Check if was permanently dismissed
        const wasPermanentlyDismissed = localStorage.getItem('pwa-install-dismissed');
        if (wasPermanentlyDismissed) {
            this.dismissed = true;
            return;
        }

        this.setupEventListeners();
        this.checkInstallability();
    }

    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            console.log('PWA install prompt event captured');
            this.deferredPrompt = e;
            this.showPrompt();
        });

        // Setup button event listeners
        const installBtn = document.getElementById('pwa-install');
        const dismissBtn = document.getElementById('pwa-dismiss');
        const closeBtn = document.getElementById('pwa-close');

        if (installBtn) {
            installBtn.addEventListener('click', () => this.handleInstall());
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.handleTemporaryDismiss());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.handlePermanentDismiss());
        }
    }

    checkInstallability() {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isPWA = window.navigator.standalone || isStandalone;
        
        if (isPWA) {
            console.log('PWA already installed');
            return;
        }

        // For iOS/Safari that don't support beforeinstallprompt
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isIOS || isSafari) {
            console.log('iOS/Safari detected - showing install prompt');
            this.showPrompt();
            return;
        }

        // Always show after 1 second if not dismissed
        setTimeout(() => {
            if (!this.dismissed) {
                console.log('Force showing PWA prompt after timeout');
                this.showPrompt();
            }
        }, 1000);
    }

    showPrompt() {
        if (this.dismissed) return;

        const prompt = document.getElementById('pwa-prompt');
        if (prompt) {
            prompt.classList.remove('hidden');
        }
    }

    hidePrompt() {
        const prompt = document.getElementById('pwa-prompt');
        if (prompt) {
            prompt.classList.add('hidden');
        }
    }

    async handleInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`PWA install prompt outcome: ${outcome}`);
            this.deferredPrompt = null;
            this.hidePrompt();
        } else {
            // For iOS Safari - show instructions
            this.showIOSInstructions();
        }
    }

    showIOSInstructions() {
        alert('Para instalar este app:\n1. Toque no botão compartilhar\n2. Selecione "Adicionar à Tela de Início"');
    }

    handleTemporaryDismiss() {
        this.hidePrompt();
        this.dismissed = true;
    }

    handlePermanentDismiss() {
        this.hidePrompt();
        this.dismissed = true;
        localStorage.setItem('pwa-install-dismissed', 'true');
    }
}

// Initialize PWA manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});