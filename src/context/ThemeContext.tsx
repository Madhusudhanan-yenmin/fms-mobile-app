import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from '../constants/colors';
import { storageService } from '../services/storage.service';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  isDark: false,
  colors: LightColors,
  setThemeMode: async () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hookColorScheme = useColorScheme();
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [mode, setMode] = useState<ThemeMode>('system');

  // Actively track device Appearance changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setSystemScheme(colorScheme);
      }
    });
    return () => sub.remove();
  }, []);

  // Sync with react-native useColorScheme hook updates
  useEffect(() => {
    if (hookColorScheme) {
      setSystemScheme(hookColorScheme);
    }
  }, [hookColorScheme]);

  // Load persisted theme preference on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await storageService.getThemeMode();
        if (stored) {
          setMode(stored);
        }
      } catch {
        // use default system mode
      }
    })();
  }, []);

  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await storageService.saveThemeMode(newMode);
    } catch {
      // storage fallback
    }
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const colors = useMemo(() => (isDark ? DarkColors : LightColors), [isDark]);

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      setThemeMode,
      toggleTheme,
    }),
    [mode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);


