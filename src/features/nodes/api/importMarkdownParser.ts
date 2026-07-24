import type { ImportNode } from '../types/Import';

const CHILDREN_HEADING = 'children';
const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;

interface HeadingBlock {
  heading: string;
  body: string;
}

/** Heading-marker lines inside fenced code blocks (e.g. a Python "# comment") don't count as headings. */
function splitByHeadings(markdown: string, level: number): HeadingBlock[] {
  const marker = `${'#'.repeat(level)} `;
  const lines = markdown.split('\n');
  const blocks: HeadingBlock[] = [];
  let current: HeadingBlock | null = null;
  let insideFence = false;

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      insideFence = !insideFence;
    }

    if (!insideFence && line.startsWith(marker)) {
      if (current) blocks.push({ ...current, body: current.body.trim() });
      current = { heading: line.slice(marker.length).trim(), body: '' };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) blocks.push({ ...current, body: current.body.trim() });
  return blocks;
}

interface OutlineNode {
  level: number;
  title: string;
  bodyLines: string[];
  children: OutlineNode[];
}

/**
 * Builds a tree from every heading level found in `body` in a single pass —
 * each heading becomes a child of the nearest preceding heading with a
 * shallower level (the standard outline-to-tree algorithm). This is what
 * makes inconsistent nesting work: some items sitting directly under a
 * "##" heading, with a "###" sub-category appearing later in that same
 * section, both end up as direct children of the "##" — no single,
 * consistent depth is required throughout the document.
 */
function buildHeadingTree(body: string): OutlineNode[] {
  const lines = body.split('\n');
  const roots: OutlineNode[] = [];
  const stack: OutlineNode[] = [];
  let insideFence = false;

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      insideFence = !insideFence;
    }

    const match = insideFence ? null : HEADING_PATTERN.exec(line);

    if (match) {
      const node: OutlineNode = { level: match[1].length, title: match[2].trim(), bodyLines: [], children: [] };

      while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }
      stack.push(node);
    } else if (stack.length > 0) {
      stack[stack.length - 1].bodyLines.push(line);
    }
  }

  return roots;
}

/** A "Children" heading is a transparent label, not a real node — splice its children into its parent. */
function flattenChildrenHeadings(nodes: OutlineNode[]): OutlineNode[] {
  const result: OutlineNode[] = [];
  for (const node of nodes) {
    if (node.title.trim().toLowerCase() === CHILDREN_HEADING) {
      result.push(...flattenChildrenHeadings(node.children));
    } else {
      result.push({ ...node, children: flattenChildrenHeadings(node.children) });
    }
  }
  return result;
}

function outlineToImportNodes(nodes: OutlineNode[]): ImportNode[] {
  return nodes.map((node) => ({
    title: node.title,
    description: node.bodyLines.join('\n').trim() || undefined,
    children: node.children.length > 0 ? outlineToImportNodes(node.children) : undefined,
  }));
}

/**
 * Turns a pasted markdown document into an ImportNode. Every top-level (`#`) heading becomes its
 * own ordered, titled `markdown` section, storing its raw body untouched — headings, tables, code
 * fences, nested `##`/`###` etc. all pass straight through to the renderer, no fixed vocabulary,
 * no schema, no limit on how many. `# Children` is the one reserved heading: it still builds a
 * nested outline of new sidebar sub-topics instead of becoming a section, exactly as before.
 */
export function parseMarkdownImport(title: string, markdown: string): ImportNode {
  const topLevel = splitByHeadings(markdown, 1);
  const dynamicSections: NonNullable<ImportNode['dynamicSections']> = [];
  let children: ImportNode[] | undefined;

  for (const block of topLevel) {
    const normalized = block.heading.trim().toLowerCase();

    if (normalized === CHILDREN_HEADING) {
      const outline = flattenChildrenHeadings(buildHeadingTree(block.body));
      children = outlineToImportNodes(outline);
      continue;
    }

    if (!block.body.trim()) continue;
    dynamicSections.push({ title: block.heading.trim(), body: block.body });
  }

  return {
    title: title.trim(),
    dynamicSections: dynamicSections.length > 0 ? dynamicSections : undefined,
    children,
  };
}

/**
 * Lightweight sibling to parseMarkdownImport for when you're only sketching
 * an outline of topic names — no "# Children" wrapper and no content-section
 * headings needed. The entire pasted document is treated as the children
 * outline directly, reusing the same outline-to-tree machinery.
 */
export function parseNamesOnlyImport(title: string, markdown: string): ImportNode {
  const outline = flattenChildrenHeadings(buildHeadingTree(markdown));
  const children = outlineToImportNodes(outline);

  return {
    title: title.trim(),
    children: children.length > 0 ? children : undefined,
  };
}
