import type { Theme } from '../types/Theme';

export interface ThemeDefinition {
  value: Theme;
  label: string;
  icon: string;
}

/**
 * Single source of truth for available themes and toggle order. Adding
 * "system" later is one entry here — ThemeProvider's cycle logic and
 * ThemeToggle's rendering don't need to change.
 */
export const THEME_REGISTRY: ThemeDefinition[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
];
