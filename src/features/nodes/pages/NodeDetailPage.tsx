import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, ConfirmDialog } from '@shared/components/composite';
import { Button, ErrorBoundary, Input } from '@shared/components/ui';
import { useNodes } from '../hooks/useNodes';
import { NodeViewer } from '../components/NodeViewer';
import { NodeEditor } from '../components/NodeEditor';

export function NodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { nodes, renameNode, removeNode } = useNodes();
  const [isEditing, setIsEditing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const node = nodes.find((item) => item.id === id);

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
              <Button variant="secondary" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? 'Done editing' : 'Edit content'}
              </Button>
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
        {isEditing ? <NodeEditor key={node.id} node={node} /> : <NodeViewer key={node.id} node={node} />}
      </ErrorBoundary>

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
    </section>
  );
}
