
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Validate theme value from localStorage
const validateThemeValue = (value: string | null): 'light' | 'dark' | null => {
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return null;
};

// Secure localStorage operations
const getStoredTheme = (): 'light' | 'dark' | null => {
  try {
    const stored = localStorage.getItem('theme');
    return validateThemeValue(stored);
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
    return null;
  }
};

const setStoredTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    } else {
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        setStoredTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setStoredTheme('light');
      }
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  }, [isDark]);

  const toggleTheme = () => {
    try {
      setIsDark(!isDark);
    } catch (error) {
      console.warn('Failed to toggle theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
