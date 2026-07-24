import { Suspense, useState, type MouseEvent, type PropsWithChildren, type ReactNode } from 'react';
import { NodeTree } from '@features/nodes';
import { useAuth } from '@features/auth';
import { Header } from './Header';

export interface AppShellProps extends PropsWithChildren {
  /** Composition slot rendered above the tree, e.g. the Import button. */
  sidebarExtra?: ReactNode;
}

export function AppShell({ sidebarExtra, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  /** On mobile the sidebar is an overlay drawer — picking a topic link should close it back over the
   *  content. On desktop it pushes content aside instead, so staying open while browsing is expected
   *  (matches typical file-tree panels) — only auto-close at the width where it's actually an overlay. */
  function handleSidebarClick(event: MouseEvent<HTMLElement>) {
    if (!(event.target as HTMLElement).closest('a')) return;
    if (window.matchMedia('(max-width: 860px)').matches) setIsSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((value) => !value)} />
      <div className="workspace">
        {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
        <aside
          className={isSidebarOpen ? 'workspace-sidebar open' : 'workspace-sidebar'}
          onClick={handleSidebarClick}
        >
          <div className="workspace-sidebar-content">
            <div className="workspace-sidebar-header">
              <span className="workspace-sidebar-header-title">Topics</span>
              <button
                type="button"
                className="sidebar-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close topic list"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            {sidebarExtra}
            <NodeTree />
          </div>
          <button type="button" className="sidebar-logout" onClick={logout}>
            <span aria-hidden="true">🚪</span>
            <span>Log out{user ? ` (${user.username})` : ''}</span>
          </button>
        </aside>
        <main className="workspace-main">
          <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
