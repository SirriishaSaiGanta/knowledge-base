import { useState } from 'react';
import { useLearningMode } from '../hooks/useLearningMode';
import { useSectionCollapseContext } from '../hooks/useSectionCollapseContext';
import { isSectionVisible, isSectionEmpty, SECTION_LABELS } from '../config/sectionRegistry';
import { SectionView } from './SectionView';
import type { KnowledgeNode } from '../types/Node';

export function NodeViewer({ node }: { node: KnowledgeNode }) {
  const { mode } = useLearningMode();
  const { expandAll, collapseAll } = useSectionCollapseContext();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const visible = node.sections.filter((section) => isSectionVisible(section, mode, revealed));
  const hidden = node.sections.filter(
    (section) => !isSectionVisible(section, mode, revealed) && !isSectionEmpty(section),
  );

  function reveal(sectionId: string) {
    setRevealed((current) => new Set(current).add(sectionId));
  }

  return (
    <div className="node-viewer">
      {visible.length > 0 && (
        <div className="section-toolbar">
          <button type="button" className="node-tree-toolbar-btn" onClick={expandAll}>
            Expand all
          </button>
          <button
            type="button"
            className="node-tree-toolbar-btn"
            onClick={() => collapseAll(visible.map((section) => section.id))}
          >
            Collapse all
          </button>
        </div>
      )}

      {visible.length === 0 && <p>No content for this mode yet.</p>}

      {visible.map((section) => (
        <SectionView key={section.id} section={section} nodeId={node.id} />
      ))}

      {hidden.length > 0 && (
        <div className="hidden-sections">
          {hidden.map((section) => (
            <button
              key={section.id}
              type="button"
              className="btn btn-ghost"
              onClick={() => reveal(section.id)}
            >
              Show {SECTION_LABELS[section.type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
