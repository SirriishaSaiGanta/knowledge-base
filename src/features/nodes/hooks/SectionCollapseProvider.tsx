import { useCallback, useState, type PropsWithChildren } from 'react';
import { localStorageAdapter } from '@data/storage/localStorageAdapter';
import type { ID } from '@shared/types/common';
import { SectionCollapseContext } from './SectionCollapseContext';

const STORAGE_KEY = 'kb:collapsedSections';

function isIdArray(value: unknown): value is ID[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readStoredIds(): ID[] {
  const stored = localStorageAdapter.get<ID[]>(STORAGE_KEY);
  return isIdArray(stored) ? stored : [];
}

/**
 * Centralized (not per-SectionView) so "expand all / collapse all" can act
 * on every section at once — persisted the same way individual toggles
 * always were, keyed by section id so it survives navigating between
 * topics.
 */
export function SectionCollapseProvider({ children }: PropsWithChildren) {
  const [collapsedIds, setCollapsedIds] = useState<Set<ID>>(() => new Set(readStoredIds()));

  const isCollapsed = useCallback((sectionId: ID) => collapsedIds.has(sectionId), [collapsedIds]);

  const toggle = useCallback((sectionId: ID) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      localStorageAdapter.set(STORAGE_KEY, [...next]);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
    localStorageAdapter.set(STORAGE_KEY, []);
  }, []);

  const collapseAll = useCallback((sectionIds: ID[]) => {
    setCollapsedIds((current) => {
      const next = new Set([...current, ...sectionIds]);
      localStorageAdapter.set(STORAGE_KEY, [...next]);
      return next;
    });
  }, []);

  return (
    <SectionCollapseContext.Provider value={{ isCollapsed, toggle, expandAll, collapseAll }}>
      {children}
    </SectionCollapseContext.Provider>
  );
}
