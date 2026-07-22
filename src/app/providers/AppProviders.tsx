import type { PropsWithChildren } from 'react';
import { TagsProvider } from '@features/tags';
import {
  NodesProvider,
  LearningModeProvider,
  NodeSearchProvider,
  NodeExpansionProvider,
  SectionCollapseProvider,
} from '@features/nodes';

/**
 * All of these are used across the whole authenticated app — the
 * tree/search feed the always-visible sidebar and header, learning mode
 * and expand/collapse state are global controls, not scoped to a single
 * route — so all are mounted once at the root rather than per-route.
 */
export function AppProviders({ children }: PropsWithChildren) {
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
