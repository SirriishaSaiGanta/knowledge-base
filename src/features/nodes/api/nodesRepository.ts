import { createSupabaseRepository } from '@data/supabaseRepository';
import type { ID } from '@shared/types/common';
import type { KnowledgeNode } from '../types/Node';

function toRow(node: KnowledgeNode): Record<string, unknown> {
  return {
    id: node.id,
    parent_id: node.parentId,
    title: node.title,
    order: node.order,
    sections: node.sections,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  };
}

function fromRow(row: Record<string, unknown>): KnowledgeNode {
  return {
    id: row.id as string,
    parentId: (row.parent_id as string | null) ?? null,
    title: row.title as string,
    order: row.order as number,
    sections: (row.sections as KnowledgeNode['sections']) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const base = createSupabaseRepository<KnowledgeNode>('nodes', toRow, fromRow);

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
