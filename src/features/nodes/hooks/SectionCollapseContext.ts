import { createContext } from 'react';
import type { ID } from '@shared/types/common';

export interface SectionCollapseResource {
  isCollapsed: (sectionId: ID) => boolean;
  toggle: (sectionId: ID) => void;
  expandAll: () => void;
  collapseAll: (sectionIds: ID[]) => void;
}

export const SectionCollapseContext = createContext<SectionCollapseResource | undefined>(undefined);
