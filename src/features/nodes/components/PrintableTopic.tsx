import { useEffect, type ElementType } from 'react';
import { createPortal } from 'react-dom';
import { ErrorBoundary } from '@shared/components/ui';
import { SECTION_LABELS, isSectionEmpty } from '../config/sectionRegistry';
import { renderSectionView } from './sections/registry';
import { useNodes } from '../hooks/useNodes';
import type { KnowledgeNode } from '../types/Node';

interface TreeEntry {
  node: KnowledgeNode;
  depth: number;
}

/** Depth-first walk of `rootId` and every descendant, in the same sibling order as the sidebar
 *  tree, pairing each node with its depth relative to the export root (0 = the topic exported). */
function collectSubtree(rootId: string, allNodes: KnowledgeNode[]): TreeEntry[] {
  const root = allNodes.find((node) => node.id === rootId);
  if (!root) return [];

  const entries: TreeEntry[] = [{ node: root, depth: 0 }];

  function walk(parentId: string, depth: number) {
    const children = allNodes
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.order - b.order);
    for (const child of children) {
      entries.push({ node: child, depth });
      walk(child.id, depth + 1);
    }
  }

  walk(rootId, 1);
  return entries;
}

/** Caps heading level so deeply nested sub-topics don't fall back to plain text — everything past
 *  depth 4 still reads as a heading, just the smallest one. */
function headingTag(depth: number): ElementType {
  return `h${Math.min(depth + 1, 5)}` as ElementType;
}

export interface PrintableTopicProps {
  rootId: string;
  onDone: () => void;
}

/** Renders the given topic and every descendant sub-topic (title + all filled-in sections) into a
 *  print-only view portalled to <body>, then hands off to the browser's native print dialog —
 *  the user picks "Save as PDF" there, which produces much better output (selectable text, real
 *  pagination, code blocks/tables/diagrams render as-is) than any client-side canvas-rasterizing
 *  PDF library would for content this varied. See the `.printable-topic` rules in global.css for
 *  the screen/print visibility split. */
export function PrintableTopic({ rootId, onDone }: PrintableTopicProps) {
  const { nodes } = useNodes();
  const entries = collectSubtree(rootId, nodes);

  useEffect(() => {
    function handleAfterPrint() {
      onDone();
    }
    window.addEventListener('afterprint', handleAfterPrint);

    // Two rAFs so the freshly-mounted content is painted before the print dialog captures it.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => window.print()));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onDone]);

  return createPortal(
    <div className="printable-topic">
      {entries.map(({ node, depth }) => {
        const Heading = headingTag(depth);
        const sections = node.sections.filter((section) => !isSectionEmpty(section));

        return (
          <article key={node.id} className="printable-node">
            <Heading>{node.title}</Heading>
            {sections.map((section) => (
              <div key={section.id} className="printable-section">
                <h5>
                  {section.type === 'markdown' ? section.content.title.trim() || 'Untitled section' : SECTION_LABELS[section.type]}
                </h5>
                <ErrorBoundary fallback={() => <p>This section couldn&apos;t be exported.</p>}>
                  {renderSectionView(section, 'light')}
                </ErrorBoundary>
              </div>
            ))}
          </article>
        );
      })}
    </div>,
    document.body,
  );
}
