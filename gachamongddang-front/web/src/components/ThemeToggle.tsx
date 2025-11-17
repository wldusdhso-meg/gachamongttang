import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <label className="swap swap-rotate">
      <input type="checkbox" className="theme-controller" checked={isDark} onChange={toggleTheme} />
      <svg className="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64 17.657A9 9 0 0018.36 4.93 7 7 0 115.64 17.657z"></path></svg>
      <svg className="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64 13a1 1 0 00-1.35-1.35A8 8 0 1111 3.71 1 1 0 0013 2a10 10 0 108.64 11z"></path></svg>
    </label>
  );
}


