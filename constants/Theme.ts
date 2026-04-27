export type ThemeMode = 'light' | 'dark';

export type ThemedColors = {
  background: string;
  primary: string;
  primaryDark: string;
  white: string;
  black: string;
  cardBackground: string;
  inputBackground: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  tabInactive: string;
  tabActive: string;
  overlay: string;
  danger: string;
  success: string;
};

export const LightColors: ThemedColors = {
  background: '#E8EAED',
  primary: '#D32F2F',
  primaryDark: '#B71C1C',
  white: '#FFFFFF',
  black: '#000000',
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F5',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  tabInactive: '#999999',
  tabActive: '#D32F2F',
  overlay: 'rgba(0,0,0,0.4)',
  danger: '#D32F2F',
  success: '#4CAF50',
};

export const DarkColors: ThemedColors = {
  background: '#0F0F12',
  primary: '#FF4D4D',
  primaryDark: '#D32F2F',
  white: '#FFFFFF',
  black: '#000000',
  cardBackground: '#1C1C20',
  inputBackground: '#26262C',
  textPrimary: '#F2F2F2',
  textSecondary: '#A8A8AD',
  textMuted: '#6E6E73',
  border: '#2E2E34',
  divider: '#2A2A30',
  tabInactive: '#6E6E73',
  tabActive: '#FF4D4D',
  overlay: 'rgba(0,0,0,0.6)',
  danger: '#FF5252',
  success: '#4CAF50',
};

const activePalette: { current: ThemedColors } = { current: LightColors };

export function setActiveThemeMode(mode: ThemeMode) {
  activePalette.current = mode === 'dark' ? DarkColors : LightColors;
}

export function getColorsForMode(mode: ThemeMode): ThemedColors {
  return mode === 'dark' ? DarkColors : LightColors;
}

const colorsProxy = new Proxy({} as ThemedColors, {
  get(_t, key: string) {
    return (activePalette.current as Record<string, string>)[key];
  },
  has(_t, key: string) {
    return key in activePalette.current;
  },
  ownKeys() {
    return Object.keys(activePalette.current);
  },
  getOwnPropertyDescriptor(_t, key: string) {
    return {
      enumerable: true,
      configurable: true,
      value: (activePalette.current as Record<string, string>)[key],
    };
  },
});

export const Theme = {
  colors: colorsProxy,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};
