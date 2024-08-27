'use client';

import { useState, useEffect, createContext } from 'react';

import useLocalStorage from '@/hooks/useLocalStorage';

export const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}>({
  theme: 'light',
  setTheme: (theme: 'light' | 'dark') => {},
});

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [storage, setStorage] = useLocalStorage('theme');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(storage.theme ?? darkMode ? 'dark' : 'light');
    setLoading(false);
  }, [loading, storage.theme]);

  useEffect(() => {
    if (loading) return;
    setStorage({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, [loading, setStorage, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
