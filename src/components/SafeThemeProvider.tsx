import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider, useTheme } from 'next-themes';

type ResolvedTheme = 'dark' | 'light';
type ThemePreference = 'system' | 'dark' | 'light';
export const THEME_STORAGE_KEY = 'portfolio-theme';

interface ThemeContextType {
  theme: ResolvedTheme;
  preference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface SafeThemeProviderProps {
  children: ReactNode;
}

const SafeThemeStateProvider = ({ children }: SafeThemeProviderProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: resolvedTheme === 'dark' ? 'dark' : 'light',
      preference:
        theme === 'dark' || theme === 'light' || theme === 'system'
          ? theme
          : 'system',
      setTheme: (nextTheme) => setTheme(nextTheme),
      mounted,
    }),
    [mounted, resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function SafeThemeProvider({ children }: SafeThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      <SafeThemeStateProvider>{children}</SafeThemeStateProvider>
    </ThemeProvider>
  );
}

export function useSafeTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      theme: 'light' as ResolvedTheme,
      preference: 'system' as ThemePreference,
      setTheme: () => {},
      mounted: false,
    };
  }

  return context;
}
