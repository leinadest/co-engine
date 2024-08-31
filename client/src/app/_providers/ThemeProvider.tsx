'use client';

import { useState, useEffect, createContext } from 'react';
import Cookies from 'js-cookie';

export const ThemeContext = createContext<{
  theme?: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}>({
  setTheme: (theme: 'light' | 'dark') => {},
});

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieTheme = Cookies.get('theme') as 'light' | 'dark' | undefined;
  const [theme, setTheme] = useState<typeof cookieTheme>(cookieTheme);

  useEffect(() => {
    if (cookieTheme) return;
    const userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    setTheme(userTheme);
  }, [cookieTheme]);

  useEffect(() => {
    if (!theme) return;
    Cookies.set('theme', theme);
    document.documentElement.classList.remove(
      theme === 'light' ? 'dark' : 'light'
    );
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
