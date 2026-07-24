import type { ImportNode } from '@features/nodes';

export function ImportPreviewTree({ node }: { node: ImportNode }) {
  const sectionCount =
    Object.keys(node.sections ?? {}).length +
    (node.dynamicSections?.length ?? 0) +
    (node.description?.trim() ? 1 : 0);
  const children = node.children ?? [];

  return (
    <li className="import-preview-item">
      <div className="import-preview-row">
        <span>{node.title || '(untitled)'}</span>
        {sectionCount > 0 && (
          <span className="import-preview-meta">
            {sectionCount} section{sectionCount === 1 ? '' : 's'}
          </span>
        )}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map((child, index) => (
            <ImportPreviewTree key={index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
