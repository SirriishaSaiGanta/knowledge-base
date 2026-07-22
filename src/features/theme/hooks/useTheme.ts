import { useContext } from 'react';
import { ThemeContext, type ThemeResource } from './ThemeContext';

export function useTheme(): ThemeResource {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
