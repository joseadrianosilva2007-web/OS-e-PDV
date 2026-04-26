import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ospdv_dark');
    if (stored) setDark(stored === 'true');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setDark(true);
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('ospdv_dark', String(dark));
  }, [dark]);

  const toggle = () => setDark(!dark);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
