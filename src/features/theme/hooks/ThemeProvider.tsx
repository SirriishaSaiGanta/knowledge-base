import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { localStorageAdapter } from "@data/storage/localStorageAdapter";
import { THEME_REGISTRY } from "../config/themeRegistry";
import type { Theme } from "../types/Theme";
import { ThemeContext } from "./ThemeContext";

const THEME_STORAGE_KEY = "kb:theme";
const DEFAULT_THEME: Theme = "dark";

function isTheme(value: unknown): value is Theme {
  return THEME_REGISTRY.some((definition) => definition.value === value);
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorageAdapter.get<Theme>(THEME_STORAGE_KEY);
    const initial = isTheme(stored) ? stored : DEFAULT_THEME;
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
    localStorageAdapter.set(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const index = THEME_REGISTRY.findIndex(
        (definition) => definition.value === current,
      );
      return THEME_REGISTRY[(index + 1) % THEME_REGISTRY.length].value;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
