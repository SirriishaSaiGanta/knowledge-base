import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppProviders } from '../providers/AppProviders';
import { AppShell } from './AppShell';

export interface AuthenticatedLayoutProps {
  sidebarExtra?: ReactNode;
}

export function AuthenticatedLayout({ sidebarExtra }: AuthenticatedLayoutProps) {
  return (
    <AppProviders>
      <AppShell sidebarExtra={sidebarExtra}>
        <Outlet />
      </AppShell>
    </AppProviders>
  );
}
