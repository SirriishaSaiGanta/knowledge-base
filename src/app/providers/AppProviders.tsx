import { useEffect, useState, type PropsWithChildren } from 'react';
import { TagsProvider } from '@features/tags';
import { tagsRepository } from '@features/tags/api/tagsRepository';
import {
  NodesProvider,
  LearningModeProvider,
  NodeSearchProvider,
  NodeExpansionProvider,
  SectionCollapseProvider,
} from '@features/nodes';
import { nodesRepository } from '@features/nodes/api/nodesRepository';
import { migrateLocalDataIfNeeded } from './migrateLocalData';

/**
 * All of these are used across the whole authenticated app — the
 * tree/search feed the always-visible sidebar and header, learning mode
 * and expand/collapse state are global controls, not scoped to a single
 * route — so all are mounted once at the root rather than per-route.
 */
export function AppProviders({ children }: PropsWithChildren) {
  /* nodesRepository/tagsRepository fetch from Supabase asynchronously, unlike the old localStorage
   * read they replaced — gating render here means every downstream hook (useNodesResource,
   * useSupabaseCrudResource, ...) can keep assuming data is already loaded by the time it runs,
   * exactly as before, instead of every consumer needing its own loading state. */
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([nodesRepository.init(), tagsRepository.init()])
      .then(() => migrateLocalDataIfNeeded())
      .then(() => {
        if (active) setIsDataReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!isDataReady) {
    return (
      <div className="login-page">
        <p>Loading your topics…</p>
      </div>
    );
  }

  return (
    <TagsProvider>
      <NodesProvider>
        <LearningModeProvider>
          <NodeSearchProvider>
            <NodeExpansionProvider>
              <SectionCollapseProvider>{children}</SectionCollapseProvider>
            </NodeExpansionProvider>
          </NodeSearchProvider>
        </LearningModeProvider>
      </NodesProvider>
    </TagsProvider>
  );
}
