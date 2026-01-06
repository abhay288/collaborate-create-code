import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('avsar-theme') as Theme;
    if (stored === 'light' || stored === 'dark') return stored;
    
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Smooth transition for theme switch
    root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Store preference
    localStorage.setItem('avsar-theme', theme);
    
    // Clean up transition after animation
    const timeout = setTimeout(() => {
      root.style.removeProperty('transition');
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('avsar-theme');
      // Only auto-switch if user hasn't set a preference
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggleTheme };
};
