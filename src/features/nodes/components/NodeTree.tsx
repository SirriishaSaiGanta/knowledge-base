import { useMemo, useState, type DragEvent, type FormEvent } from 'react';
import { Button, Input } from '@shared/components/ui';
import type { ID } from '@shared/types/common';
import { useNodes } from '../hooks/useNodes';
import { useNodeSearch } from '../hooks/useNodeSearch';
import { useNodeExpansion } from '../hooks/useNodeExpansion';
import { filterTree } from '../hooks/filterTree';
import { NodeTreeItem } from './NodeTreeItem';
import type { TreeNode } from '../types/Node';

function collectExpandableIds(nodes: TreeNode[]): ID[] {
  return nodes.flatMap((node) =>
    node.children.length > 0 ? [node.id, ...collectExpandableIds(node.children)] : [],
  );
}

export function NodeTree() {
  const { tree, createNode, moveNode } = useNodes();
  const { query } = useNodeSearch();
  const { expandAll, collapseAll } = useNodeExpansion();
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [title, setTitle] = useState('');
  const [isRootDropActive, setIsRootDropActive] = useState(false);

  const visibleTree = useMemo(() => filterTree(tree, query), [tree, query]);

  function handleAddRoot(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createNode({ title: trimmed, parentId: null, order: tree.length });
    setTitle('');
    setIsAddingRoot(false);
  }

  function handleRootDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsRootDropActive(true);
  }

  function handleRootDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsRootDropActive(false);
    const draggedId = event.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    moveNode(draggedId, null, tree.length);
  }

  return (
    <nav className="node-tree">
      {tree.length > 0 && (
        <div className="node-tree-toolbar">
          <button type="button" className="node-tree-toolbar-btn" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" className="node-tree-toolbar-btn" onClick={() => collapseAll(collectExpandableIds(tree))}>
            Collapse all
          </button>
        </div>
      )}

      {query.trim() && visibleTree.length === 0 ? (
        <p className="node-tree-empty">No topics match "{query.trim()}".</p>
      ) : (
        <ul>
          {visibleTree.map((node) => (
            <NodeTreeItem key={node.id} node={node} depth={0} />
          ))}
        </ul>
      )}

      {tree.length > 0 && !query.trim() && (
        <div
          className={isRootDropActive ? 'node-tree-root-drop active' : 'node-tree-root-drop'}
          onDragOver={handleRootDragOver}
          onDragLeave={() => setIsRootDropActive(false)}
          onDrop={handleRootDrop}
        >
          Drop here to move to top level
        </div>
      )}

      {isAddingRoot ? (
        <form className="node-tree-add-form" onSubmit={handleAddRoot}>
          <Input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => !title && setIsAddingRoot(false)}
            placeholder="New topic title"
          />
        </form>
      ) : (
        <Button variant="ghost" onClick={() => setIsAddingRoot(true)}>
          + New topic
        </Button>
      )}
    </nav>
  );
}
