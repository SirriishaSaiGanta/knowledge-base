import { createRepository } from '@data/createRepository';
import { localStorageAdapter } from '@data/storage/localStorageAdapter';
import type { ID } from '@shared/types/common';
import type { KnowledgeNode } from '../types/Node';

const base = createRepository<KnowledgeNode>('kb:nodes', localStorageAdapter);

function collectDescendantIds(id: ID, all: KnowledgeNode[]): ID[] {
  const directChildren = all.filter((node) => node.parentId === id);
  return directChildren.flatMap((child) => [child.id, ...collectDescendantIds(child.id, all)]);
}

export const nodesRepository = {
  ...base,

  getChildren(parentId: ID | null): KnowledgeNode[] {
    return base
      .getAll()
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  },

  getDescendantIds(id: ID): ID[] {
    return collectDescendantIds(id, base.getAll());
  },

  /** Deletes a node and its entire subtree. */
  removeSubtree(id: ID): void {
    const all = base.getAll();
    for (const nodeId of [id, ...collectDescendantIds(id, all)]) {
      base.remove(nodeId);
    }
  },
};
