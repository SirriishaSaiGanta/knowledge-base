import { THEME_REGISTRY } from '../config/themeRegistry';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const currentIndex = THEME_REGISTRY.findIndex((definition) => definition.value === theme);
  const next = THEME_REGISTRY[(currentIndex + 1) % THEME_REGISTRY.length];

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${next.label} theme`}
      title={`Switch to ${next.label} theme`}
    >
      {next.icon}
    </button>
  );
}
