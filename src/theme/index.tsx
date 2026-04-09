import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import type { ThemeModePreference } from '../types/models';

export interface AppTheme {
  name: 'light' | 'dark';
  colors: {
    background: string;
    backgroundElevated: string;
    surface: string;
    surfaceMuted: string;
    card: string;
    text: string;
    textMuted: string;
    heading: string;
    primary: string;
    primaryStrong: string;
    accent: string;
    accentSoft: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
    divider: string;
    shadow: string;
    overlay: string;
    chipBackground: string;
    chipText: string;
    progressTrack: string;
    tabBar: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  typography: {
    display: string;
    heading: string;
    body: string;
    bodyMedium: string;
    label: string;
  };
}

const baseMetrics = {
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 40,
  },
  radii: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  typography: {
    display: 'SourceSerif4_700Bold',
    heading: 'Manrope_700Bold',
    body: 'Manrope_400Regular',
    bodyMedium: 'Manrope_500Medium',
    label: 'Manrope_600SemiBold',
  },
};

export const lightTheme: AppTheme = {
  name: 'light',
  ...baseMetrics,
  colors: {
    background: '#f2f5f9',
    backgroundElevated: '#e8eef5',
    surface: '#ffffff',
    surfaceMuted: '#f7f9fc',
    card: '#ffffff',
    text: '#304256',
    textMuted: '#65758b',
    heading: '#132238',
    primary: '#1b5d8e',
    primaryStrong: '#0f2740',
    accent: '#c48f4b',
    accentSoft: '#f9ecd8',
    success: '#24744c',
    warning: '#c7862a',
    danger: '#be4d46',
    border: '#d6dee8',
    divider: '#e6ebf2',
    shadow: '#0f2740',
    overlay: 'rgba(15, 39, 64, 0.08)',
    chipBackground: '#eef4fb',
    chipText: '#1b5d8e',
    progressTrack: '#dbe4ee',
    tabBar: '#ffffff',
  },
};

export const darkTheme: AppTheme = {
  name: 'dark',
  ...baseMetrics,
  colors: {
    background: '#08111d',
    backgroundElevated: '#0c1a2a',
    surface: '#102030',
    surfaceMuted: '#13273a',
    card: '#102030',
    text: '#d4deea',
    textMuted: '#94a3b8',
    heading: '#f7fafc',
    primary: '#70b7f2',
    primaryStrong: '#d4e7f8',
    accent: '#e1b06d',
    accentSoft: '#3d2d1e',
    success: '#67c58d',
    warning: '#e9ba6f',
    danger: '#f18b82',
    border: '#274158',
    divider: '#1b3145',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.28)',
    chipBackground: '#183149',
    chipText: '#9fd0f7',
    progressTrack: '#1f3448',
    tabBar: '#0c1a2a',
  },
};

const ThemeContext = createContext<AppTheme>(lightTheme);

function resolveTheme(preference: ThemeModePreference, systemPreference: ReturnType<typeof useColorScheme>) {
  if (preference === 'system') {
    return systemPreference === 'dark' ? darkTheme : lightTheme;
  }

  return preference === 'dark' ? darkTheme : lightTheme;
}

export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const themeMode = useAppStore((state) => state.preferences.themeMode);
  const systemPreference = useColorScheme();
  const theme = useMemo(
    () => resolveTheme(themeMode, systemPreference),
    [systemPreference, themeMode],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function useNavigationTheme(): NavigationTheme {
  const theme = useAppTheme();

  return useMemo(() => {
    const base = theme.name === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        primary: theme.colors.primary,
        text: theme.colors.heading,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
      fonts: base.fonts,
    };
  }, [theme]);
}

export function getCardShadow(theme: AppTheme) {
  return {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.name === 'dark' ? 0.16 : 0.08,
    shadowRadius: 18,
    elevation: theme.name === 'dark' ? 0 : 4,
  };
}
