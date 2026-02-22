import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Lang } from '../i18n';

export type ThemeMode = 'light' | 'dark' | 'hinglish';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isHinglish: boolean;
  lang: Lang;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  isHinglish: false,
  lang: 'en',
  setTheme: () => {},
  cycleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  const isDark = theme === 'dark';
  const isHinglish = theme === 'hinglish';
  const lang: Lang = isHinglish ? 'hi' : 'en';

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'hinglish';
      return 'light';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, isHinglish, lang, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
