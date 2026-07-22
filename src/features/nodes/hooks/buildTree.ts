import type { ID } from '@shared/types/common';
import type { KnowledgeNode, TreeNode } from '../types/Node';

export function buildTree(nodes: KnowledgeNode[]): TreeNode[] {
  const byParent = new Map<ID | null, KnowledgeNode[]>();

  for (const node of nodes) {
    const siblings = byParent.get(node.parentId) ?? [];
    siblings.push(node);
    byParent.set(node.parentId, siblings);
  }

  function attach(parentId: ID | null): TreeNode[] {
    const children = (byParent.get(parentId) ?? []).slice().sort((a, b) => a.order - b.order);
    return children.map((node) => ({ ...node, children: attach(node.id) }));
  }

  return attach(null);
}
