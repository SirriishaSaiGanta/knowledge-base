import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, LoginPage } from '@features/auth';
import { NodesIndexPage, NodeDetailPage } from '@features/nodes';
import { TagsPage } from '@features/tags';
import { ImportButton } from '@features/import';
import { AuthenticatedLayout } from './layout/AuthenticatedLayout';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout sidebarExtra={<ImportButton lockDestination />} />}>
          <Route path="/" element={<Navigate to="/nodes" replace />} />

          <Route path="/nodes" element={<NodesIndexPage />} />
          <Route
            path="/nodes/:id"
            element={
              <NodeDetailPage
                renderExtraActions={(node) => <ImportButton targetNode={node} lockDestination label="Import here" />}
              />
            }
          />

          <Route path="/tags" element={<TagsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
