// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, ThemeColors } from '../constants/theme';

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  themeMode: 'system' | 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: darkTheme,
  setThemeMode: () => {},
  themeMode: 'system',
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  // Si on est en "system", on check le scheme, mais pour éviter les sauts au début on met dark par défaut si non défini
  const isDark = themeMode === 'system' ? (systemColorScheme !== 'light') : themeMode === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, colors, setThemeMode, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
