import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { version as ReactVersion } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface SafeThemeProviderProps {
  children: ReactNode;
}

export function SafeThemeProvider({ children }: SafeThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('[Debug] React version (SafeThemeProvider):', ReactVersion);
    setMounted(true);
    
    // Check for saved theme or default to system
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemPreference;
    
    setThemeState(savedTheme || 'system');
    
    // Apply theme to document
    const applyTheme = (newTheme: Theme) => {
      const root = document.documentElement;
      
      if (newTheme === 'system') {
        root.classList.toggle('dark', systemPreference === 'dark');
      } else {
        root.classList.toggle('dark', newTheme === 'dark');
      }
    };

    applyTheme(initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const root = document.documentElement;
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const value = {
    theme,
    setTheme,
    mounted
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSafeTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback for when context is not available
    return {
      theme: 'system' as Theme,
      setTheme: () => {},
      mounted: false
    };
  }
  return context;
}