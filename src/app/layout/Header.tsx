import { LearningModeSwitcher, useNodeSearch } from "@features/nodes";
import { ThemeToggle } from "@features/theme";
import { useAuth } from "@features/auth";

export function Header() {
  const { query, setQuery } = useNodeSearch();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-left">
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

        <LearningModeSwitcher />

        <ThemeToggle />

        <button type="button" className="app-header-logout" onClick={logout}>
          Log out{user ? ` (${user.username})` : ""}
        </button>
      </div>
    </header>
  );
}
