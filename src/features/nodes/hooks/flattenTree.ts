import type { ID } from '@shared/types/common';
import type { TreeNode } from '../types/Node';

export interface FlatNodeOption {
  id: ID;
  title: string;
  depth: number;
}

/** Depth-first flattening for UI pickers (e.g. "import into" destination selection). */
export function flattenTree(tree: TreeNode[], depth = 0): FlatNodeOption[] {
  return tree.flatMap((node) => [
    { id: node.id, title: node.title, depth },
    ...flattenTree(node.children, depth + 1),
  ]);
}
