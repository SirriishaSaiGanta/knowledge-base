import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, ConfirmDialog } from '@shared/components/composite';
import { Button, ErrorBoundary, Input } from '@shared/components/ui';
import { useNodes } from '../hooks/useNodes';
import { NodeViewer } from '../components/NodeViewer';
import { NodeEditor } from '../components/NodeEditor';
import { PrintableTopic } from '../components/PrintableTopic';
import type { KnowledgeNode } from '../types/Node';

export interface NodeDetailPageProps {
  /**
   * Composition slot for app-level actions that need this node's id (e.g.
   * "Import here") without features/nodes depending on features/import —
   * same pattern as WorkspaceLayout's sidebarExtra.
   */
  renderExtraActions?: (node: KnowledgeNode) => ReactNode;
}

export function NodeDetailPage({ renderExtraActions }: NodeDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { nodes, renameNode, removeNode } = useNodes();
  const [isEditing, setIsEditing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  const node = nodes.find((item) => item.id === id);

  // Warns on refresh/close-tab while a section has edits since its last "Save section" click —
  // in-app navigation (switching topics, browser back) isn't covered, since that's a client-side
  // route change React can't intercept without a data router.
  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, hasUnsavedChanges]);

  if (!node) {
    return (
      <section>
        <p>Topic not found.</p>
        <Link to="/nodes">Back to tree</Link>
      </section>
    );
  }

  function startRenaming() {
    setTitleDraft(node!.title);
    setIsRenaming(true);
  }

  function handleRenameSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = titleDraft.trim();
    if (trimmed) renameNode(node!.id, trimmed);
    setIsRenaming(false);
  }

  function handleToggleEditing() {
    if (isEditing && hasUnsavedChanges) {
      setIsConfirmingDiscard(true);
      return;
    }
    setIsEditing((value) => !value);
  }

  return (
    <section>
      {isRenaming ? (
        <form className="node-title-form" onSubmit={handleRenameSubmit}>
          <Input
            autoFocus
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            aria-label="Topic title"
          />
          <Button type="submit" variant="secondary">
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsRenaming(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <PageHeader
          title={node.title}
          actions={
            <>
              <Button variant="secondary" onClick={startRenaming}>
                Rename
              </Button>
              <Button variant="secondary" onClick={handleToggleEditing}>
                {isEditing ? 'Done editing' : 'Edit content'}
              </Button>
              <Button variant="secondary" onClick={() => setIsExporting(true)} disabled={isExporting}>
                Export PDF
              </Button>
              {renderExtraActions?.(node)}
              <Button variant="danger" onClick={() => setIsConfirmingDelete(true)}>
                Delete
              </Button>
            </>
          }
        />
      )}

      <ErrorBoundary
        fallback={(error, reset) => (
          <div className="page-error">
            <p>Something went wrong displaying this topic{error.message ? `: ${error.message}` : '.'}</p>
            <div className="page-error-actions">
              <Button variant="secondary" onClick={reset}>
                Try again
              </Button>
              <Link to="/nodes">Back to tree</Link>
            </div>
          </div>
        )}
      >
        {isEditing ? (
          <NodeEditor key={node.id} node={node} onDirtyChange={setHasUnsavedChanges} />
        ) : (
          <NodeViewer key={node.id} node={node} />
        )}
      </ErrorBoundary>

      {isExporting && <PrintableTopic rootId={node.id} onDone={() => setIsExporting(false)} />}

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Delete topic"
        message={`Delete "${node.title}" and all of its sub-topics? This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setIsConfirmingDelete(false)}
        onConfirm={() => {
          removeNode(node.id);
          navigate('/nodes');
        }}
      />

      <ConfirmDialog
        open={isConfirmingDiscard}
        title="Discard unsaved changes?"
        message="One or more sections have edits that haven't been saved. Leaving edit mode now will discard them."
        confirmLabel="Discard"
        onCancel={() => setIsConfirmingDiscard(false)}
        onConfirm={() => {
          setIsConfirmingDiscard(false);
          setIsEditing(false);
        }}
      />
    </section>
  );
}
