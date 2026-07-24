import type { TreeNode } from '../types/Node';
import type { Section } from '../types/Section';

/**
 * `markdown` sections have a known, meaningful shape ({title, body}) worth matching field-by-field.
 * Every other (legacy, fixed) section type has its own bespoke nested shape — rather than writing
 * per-type field extraction for all 12, stringifying the content is a simple, honest way to make
 * "does this section contain X anywhere" true without needing to know its shape.
 */
function sectionMatches(section: Section, normalized: string): boolean {
  if (section.type === 'markdown') {
    return (
      section.content.title.toLowerCase().includes(normalized) ||
      section.content.body.toLowerCase().includes(normalized)
    );
  }
  return JSON.stringify(section.content).toLowerCase().includes(normalized);
}

/**
 * Keeps a node if its own title or any of its section content matches, or any descendant matches
 * (so the ancestor chain to a nested match stays visible).
 */
export function filterTree(tree: TreeNode[], query: string): TreeNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return tree;

  function filterNode(node: TreeNode): TreeNode | null {
    const children = node.children
      .map(filterNode)
      .filter((child): child is TreeNode => child !== null);

    const selfMatches =
      node.title.toLowerCase().includes(normalized) ||
      node.sections.some((section) => sectionMatches(section, normalized));
    if (!selfMatches && children.length === 0) return null;

    return { ...node, children };
  }

  return tree.map(filterNode).filter((node): node is TreeNode => node !== null);
}
