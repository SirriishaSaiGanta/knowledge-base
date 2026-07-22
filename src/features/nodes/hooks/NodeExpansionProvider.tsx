import { useCallback, useState, type PropsWithChildren } from 'react';
import type { ID } from '@shared/types/common';
import { NodeExpansionContext } from './NodeExpansionContext';

/** Absence from the set means expanded — matches the tree's previous "expanded by default" behavior. */
export function NodeExpansionProvider({ children }: PropsWithChildren) {
  const [collapsedIds, setCollapsedIds] = useState<Set<ID>>(new Set());

  const isExpanded = useCallback((nodeId: ID) => !collapsedIds.has(nodeId), [collapsedIds]);

  const toggle = useCallback((nodeId: ID) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsedIds(new Set()), []);

  const collapseAll = useCallback((nodeIds: ID[]) => setCollapsedIds(new Set(nodeIds)), []);

  return (
    <NodeExpansionContext.Provider value={{ isExpanded, toggle, expandAll, collapseAll }}>
      {children}
    </NodeExpansionContext.Provider>
  );
}
