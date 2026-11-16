export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  isDark: boolean;
  midnight: string;
  purple: string;
  gold: string;
  ivory: string;
  card: string;
  ink: string;
  muted: string;
  line: string;
  white: string;
  lilac: string;
  green: string;
  red: string;
  amber: string;
}

export const LIGHT_THEME: ThemePalette = {
  isDark: false,
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  card: '#FFFFFF',
  ink: '#211B32',
  muted: '#827B8D',
  line: '#EAE5EE',
  white: '#FFFFFF',
  lilac: '#EEE9F6',
  green: '#638B70',
  red: '#B75D61',
  amber: '#E5A548',
};

export const DARK_THEME: ThemePalette = {
  isDark: true,
  midnight: '#0D0A1B',
  purple: '#22193A',
  gold: '#E5C494',
  ivory: '#120F24',
  card: '#1C1833',
  ink: '#EDE8F5',
  muted: '#A29AA8',
  line: '#2E274A',
  white: '#1C1833',
  lilac: '#2A2244',
  green: '#74A083',
  red: '#D16D71',
  amber: '#E8B35A',
};

export function getThemeColors(mode: ThemeMode): ThemePalette {
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
}

export function toggleTheme(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}
