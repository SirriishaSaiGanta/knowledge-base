import { useState, type DragEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Input } from '@shared/components/ui';
import { useNodes } from '../hooks/useNodes';
import { useNodeExpansion } from '../hooks/useNodeExpansion';
import type { TreeNode } from '../types/Node';

type DropZone = 'before' | 'inside' | 'after';

export function NodeTreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const { id: activeId } = useParams<{ id: string }>();
  const { createNode, moveNode } = useNodes();
  const { isExpanded, toggle } = useNodeExpansion();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dropZone, setDropZone] = useState<DropZone | null>(null);
  const hasChildren = node.children.length > 0;
  const expanded = isExpanded(node.id);

  function handleAddChild(event: FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    createNode({ title, parentId: node.id, order: node.children.length });
    setNewTitle('');
    setIsAdding(false);
    if (!expanded) toggle(node.id);
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData('text/plain', node.id);
    event.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    setDropZone(ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside');
  }

  function handleDragLeave() {
    setDropZone(null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    const zone = dropZone;
    setDropZone(null);
    if (!draggedId || draggedId === node.id || !zone) return;

    if (zone === 'inside') {
      moveNode(draggedId, node.id, node.children.length);
      if (!expanded) toggle(node.id);
    } else {
      moveNode(draggedId, node.parentId, zone === 'before' ? node.order : node.order + 1);
    }
  }

  return (
    <li className="node-tree-item">
      <div
        className={['node-tree-row', dropZone && `drop-${dropZone}`].filter(Boolean).join(' ')}
        style={{ paddingLeft: depth * 16 }}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hasChildren ? (
          <button type="button" className="node-tree-toggle" onClick={() => toggle(node.id)}>
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="node-tree-toggle-spacer" />
        )}
        <Link to={`/nodes/${node.id}`} className={node.id === activeId ? 'active' : undefined}>
          {node.title}
        </Link>
        <button
          type="button"
          className="node-tree-add"
          onClick={() => setIsAdding(true)}
          aria-label={`Add child under ${node.title}`}
        >
          +
        </button>
      </div>

      {isAdding && (
        <form className="node-tree-add-form" style={{ paddingLeft: (depth + 1) * 16 }} onSubmit={handleAddChild}>
          <Input
            autoFocus
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onBlur={() => !newTitle && setIsAdding(false)}
            placeholder="New node title"
          />
        </form>
      )}

      {expanded && hasChildren && (
        <ul>
          {node.children.map((child) => (
            <NodeTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
