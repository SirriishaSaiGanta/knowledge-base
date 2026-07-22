import type { TreeNode } from '../types/Node';

/**
 * Keeps a node if its own title matches, or any descendant matches (so the
 * ancestor chain to a nested match stays visible). Title-only for now —
 * matching section content/tags is the natural next step once full-text
 * search across the knowledge base is built.
 */
export function filterTree(tree: TreeNode[], query: string): TreeNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tree;

  function filterNode(node: TreeNode): TreeNode | null {
    const children = node.children
      .map(filterNode)
      .filter((child): child is TreeNode => child !== null);

    const selfMatches = node.title.toLowerCase().includes(normalized);
    if (!selfMatches && children.length === 0) return null;

    return { ...node, children };
  }

  return tree.map(filterNode).filter((node): node is TreeNode => node !== null);
}
