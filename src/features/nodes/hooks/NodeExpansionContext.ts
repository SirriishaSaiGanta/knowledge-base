import { createContext } from 'react';
import type { ID } from '@shared/types/common';

export interface NodeExpansionResource {
  isExpanded: (nodeId: ID) => boolean;
  toggle: (nodeId: ID) => void;
  expandAll: () => void;
  collapseAll: (nodeIds: ID[]) => void;
}

export const NodeExpansionContext = createContext<NodeExpansionResource | undefined>(undefined);
