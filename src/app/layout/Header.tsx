import { LearningModeSwitcher, useNodeSearch } from "@features/nodes";
import { ThemeToggle } from "@features/theme";
import { ImportButton } from "@features/import";

export interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const { query, setQuery } = useNodeSearch();

  return (
    <header className="app-header">
      <div className="app-header-left">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close topic list' : 'Open topic list'}
          aria-expanded={isSidebarOpen}
        >
          <span aria-hidden="true">{isSidebarOpen ? '✕' : '☰'}</span>
        </button>
        <span className="app-header-title">My Knowledge Hub</span>
      </div>

      {/* Reserved for future breadcrumbs / current-topic display. */}
      <div className="app-header-center" />

      <div className="app-header-right">
        <div className="app-header-search">
          <span className="app-header-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics, content, tags..."
            aria-label="Search"
          />
        </div>

        <ImportButton label="Import" />

        <LearningModeSwitcher />

        <ThemeToggle />
      </div>
    </header>
  );
}
