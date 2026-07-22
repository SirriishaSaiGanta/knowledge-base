import type { Identifiable, Timestamped, ID } from '@shared/types/common';
import type { Section } from './Section';

export interface KnowledgeNode extends Identifiable, Timestamped {
  parentId: ID | null;
  title: string;
  order: number;
  sections: Section[];
}

/** Fields needed to create a node; sections start empty and are added individually. */
export type NodeInput = Pick<KnowledgeNode, 'title' | 'parentId' | 'order'>;

/** In-memory view built from the flat KnowledgeNode[] — never persisted directly. */
export interface TreeNode extends KnowledgeNode {
  children: TreeNode[];
}
