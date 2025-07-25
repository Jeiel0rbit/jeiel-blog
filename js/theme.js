// Theme management

class ThemeManager {
    constructor() {
        this.isDark = false;
        this.init();
    }

    init() {
        // Get stored theme or use system preference
        const storedTheme = this.getStoredTheme();
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (storedTheme) {
            this.isDark = storedTheme === 'dark';
        } else {
            this.isDark = prefersDark;
        }

        this.applyTheme();
        this.setupEventListeners();
    }

    getStoredTheme() {
        try {
            const stored = localStorage.getItem('theme');
            return stored === 'light' || stored === 'dark' ? stored : null;
        } catch (error) {
            console.warn('Failed to read theme from localStorage:', error);
            return null;
        }
    }

    setStoredTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error);
        }
    }

    applyTheme() {
        try {
            const html = document.documentElement;
            const sunIcon = document.getElementById('sun-icon');
            const moonIcon = document.getElementById('moon-icon');

            if (this.isDark) {
                html.classList.add('dark');
                sunIcon?.classList.remove('hidden');
                moonIcon?.classList.add('hidden');
                this.setStoredTheme('dark');
            } else {
                html.classList.remove('dark');
                sunIcon?.classList.add('hidden');
                moonIcon?.classList.remove('hidden');
                this.setStoredTheme('light');
            }
        } catch (error) {
            console.warn('Failed to apply theme:', error);
        }
    }

    toggle() {
        try {
            this.isDark = !this.isDark;
            this.applyTheme();
        } catch (error) {
            console.warn('Failed to toggle theme:', error);
        }
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.isDark = e.matches;
                this.applyTheme();
            }
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});