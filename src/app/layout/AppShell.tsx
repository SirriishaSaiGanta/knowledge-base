import { Suspense, type PropsWithChildren, type ReactNode } from 'react';
import { NodeTree } from '@features/nodes';
import { Header } from './Header';

export interface AppShellProps extends PropsWithChildren {
  /** Composition slot rendered above the tree, e.g. the Import button. */
  sidebarExtra?: ReactNode;
}

export function AppShell({ sidebarExtra, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Header />
      <div className="workspace">
        <aside className="workspace-sidebar">
          {sidebarExtra}
          <NodeTree />
        </aside>
        <main className="workspace-main">
          <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
