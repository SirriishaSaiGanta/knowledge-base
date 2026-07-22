import { useContext } from 'react';
import { SectionCollapseContext, type SectionCollapseResource } from './SectionCollapseContext';

export function useSectionCollapseContext(): SectionCollapseResource {
  const context = useContext(SectionCollapseContext);
  if (!context) throw new Error('useSectionCollapseContext must be used within a SectionCollapseProvider');
  return context;
}
