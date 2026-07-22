import type { ID } from '@shared/types/common';
import { getSectionDefinition } from '../config/sectionRegistry';
import type { SectionInput, SectionType } from '../types/Section';
import type { ConflictStrategy, ImportNode, ImportOperations, ImportSummary } from '../types/Import';

export function importTree(
  node: ImportNode,
  parentId: ID | null,
  order: number,
  operations: ImportOperations,
  strategy: ConflictStrategy = 'skip',
): ImportSummary {
  const summary: ImportSummary = { created: 0, skipped: 0 };
  importNodeRecursive(node, parentId, order, operations, strategy, summary);
  return summary;
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
    summary.skipped += 1;

    switch (strategy) {
      case 'replace':
        // Extension point: overwrite the existing node's title/sections.
        // Falls back to skip until implemented, so imports stay non-destructive.
        break;
      case 'merge':
        // Extension point: merge incoming sections/tags into the existing node.
        // Falls back to skip until implemented.
        break;
      case 'skip':
      default:
        break;
    }
  } else {
    const tagIds = operations.resolveTagIds(node.tags ?? []);
    const created = operations.createNode({ title: node.title, parentId, order });
    summary.created += 1;
    targetId = created.id;

    if (node.description?.trim()) {
      operations.addSection(targetId, { type: 'shortDescription', content: node.description, tagIds });
    }

    for (const [type, content] of Object.entries(node.sections ?? {})) {
      const sectionType = type as SectionType;
      const definition = getSectionDefinition(sectionType);
      if (definition.isEmpty(content as never)) continue;
      operations.addSection(targetId, { type: sectionType, content, tagIds } as SectionInput);
    }
  }

  (node.children ?? []).forEach((child, index) => {
    importNodeRecursive(child, targetId, index, operations, strategy, summary);
  });
}
