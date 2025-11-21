import { useCallback, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'ui.theme';
const DEFAULT_THEME = 'cupcake';

export type ThemeName = 'cupcake' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const saved = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null) || DEFAULT_THEME;
    setThemeState(saved);
    document.body.setAttribute('data-theme', saved);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'cupcake' ? 'dark' : 'cupcake');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}


