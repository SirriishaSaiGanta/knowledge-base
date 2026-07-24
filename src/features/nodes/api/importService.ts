import type { ID } from '@shared/types/common';
import { getSectionDefinition } from '../config/sectionRegistry';
import type { Section, SectionInput, SectionType } from '../types/Section';
import type { ConflictStrategy, ImportNode, ImportOperations, ImportSummary } from '../types/Import';

/**
 * Adds content directly on an existing node instead of creating or matching a child — used by
 * "Import here" on a topic's own page, where the pasted content belongs to that topic itself, not
 * a new sibling of it. `strategy: 'merge'` (the default) adds the parsed sections alongside
 * whatever the node already has; `'replace'` clears every existing section first. Either way,
 * this only runs when the parsed payload actually carries a description/sections (i.e. "full
 * topic" content) — a names-only outline (just `# Children`) must not touch existing sections just
 * because it didn't mention any.
 */
export function importIntoNode(
  node: ImportNode,
  targetId: ID,
  existingSections: Section[],
  operations: ImportOperations,
  strategy: 'merge' | 'replace' = 'merge',
): ImportSummary {
  const summary: ImportSummary = { created: 0, replaced: 0, skipped: 0 };
  const hasContent =
    Boolean(node.description?.trim()) ||
    Object.keys(node.sections ?? {}).length > 0 ||
    (node.dynamicSections?.length ?? 0) > 0;

  if (hasContent) {
    const tagIds = operations.resolveTagIds(node.tags ?? []);
    if (strategy === 'replace') {
      existingSections.forEach((section) => operations.removeSection(targetId, section.id));
    }
    populateSections(targetId, node, operations, tagIds);
    summary.replaced += 1;
  }

  (node.children ?? []).forEach((child, index) => {
    importNodeRecursive(child, targetId, index, operations, 'skip', summary);
  });

  return summary;
}

export function importTree(
  node: ImportNode,
  parentId: ID | null,
  order: number,
  operations: ImportOperations,
  strategy: ConflictStrategy = 'skip',
): ImportSummary {
  const summary: ImportSummary = { created: 0, replaced: 0, skipped: 0 };
  importNodeRecursive(node, parentId, order, operations, strategy, summary);
  return summary;
}

/**
 * Adds shortDescription (if present), every non-empty legacy typed section (JSON import only),
 * then every dynamic markdown section (Markdown import only) — in that order, onto `targetId`.
 * Dynamic sections are pushed in `node.dynamicSections`' array order, which is document order,
 * so section order on the node ends up matching the order headings appeared in the source.
 */
function populateSections(targetId: ID, node: ImportNode, operations: ImportOperations, tagIds: ID[]): void {
  if (node.description?.trim()) {
    operations.addSection(targetId, { type: 'shortDescription', content: node.description, tagIds });
  }

  for (const [type, content] of Object.entries(node.sections ?? {})) {
    const sectionType = type as SectionType;
    const definition = getSectionDefinition(sectionType);
    if (definition.isEmpty(content as never)) continue;
    operations.addSection(targetId, { type: sectionType, content, tagIds } as SectionInput);
  }

  for (const { title, body } of node.dynamicSections ?? []) {
    if (!title.trim() && !body.trim()) continue;
    operations.addSection(targetId, { type: 'markdown', content: { title, body }, tagIds });
  }
}

function importNodeRecursive(
  node: ImportNode,
  parentId: ID | null,
  order: number,
  operations: ImportOperations,
  strategy: ConflictStrategy,
  summary: ImportSummary,
): void {
  const existing = operations.findChildByTitle(parentId, node.title);
  let targetId: ID;

  if (existing) {
    targetId = existing.id;

    switch (strategy) {
      case 'replace': {
        const tagIds = operations.resolveTagIds(node.tags ?? []);
        existing.sections.forEach((section) => operations.removeSection(targetId, section.id));
        populateSections(targetId, node, operations, tagIds);
        summary.replaced += 1;
        break;
      }
      case 'merge': {
        // Adds the incoming sections alongside whatever the existing node already has —
        // unlike 'replace', nothing existing is removed first.
        const tagIds = operations.resolveTagIds(node.tags ?? []);
        populateSections(targetId, node, operations, tagIds);
        summary.replaced += 1;
        break;
      }
      case 'skip':
      default:
        summary.skipped += 1;
        break;
    }
  } else {
    const tagIds = operations.resolveTagIds(node.tags ?? []);
    const created = operations.createNode({ title: node.title, parentId, order });
    summary.created += 1;
    targetId = created.id;
    populateSections(targetId, node, operations, tagIds);
  }

  (node.children ?? []).forEach((child, index) => {
    importNodeRecursive(child, targetId, index, operations, strategy, summary);
  });
}
