import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeMode,
  ThemedColors,
  LightColors,
  DarkColors,
  setActiveThemeMode,
  getColorsForMode,
} from '@/constants/Theme';
import { users } from './api';

const STORAGE_KEY = 'themeMode';

type ThemeContextType = {
  mode: ThemeMode;
  colors: ThemedColors;
  setMode: (mode: ThemeMode, persistRemote?: boolean) => Promise<void>;
  toggleMode: () => Promise<void>;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setActiveThemeMode(saved);
          setModeState(saved);
        }
      } catch {
        // ignore
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setMode = useCallback(async (next: ThemeMode, persistRemote = true) => {
    setActiveThemeMode(next);
    setModeState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    if (persistRemote) {
      try {
        await users.updateSettings({ darkMode: next === 'dark' });
      } catch {
        // best effort, local pref still applies
      }
    }
  }, []);

  const toggleMode = useCallback(async () => {
    await setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo<ThemeContextType>(() => ({
    mode,
    colors: mode === 'dark' ? DarkColors : LightColors,
    setMode,
    toggleMode,
    isReady,
  }), [mode, setMode, toggleMode, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: 'light',
      colors: getColorsForMode('light'),
      setMode: async () => {},
      toggleMode: async () => {},
      isReady: true,
    };
  }
  return ctx;
}
