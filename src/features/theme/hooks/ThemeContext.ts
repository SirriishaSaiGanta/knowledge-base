import { createContext } from 'react';
import type { Theme } from '../types/Theme';

export interface ThemeResource {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeResource | undefined>(undefined);
