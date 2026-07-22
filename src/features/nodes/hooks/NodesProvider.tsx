import type { PropsWithChildren } from 'react';
import { useNodesResource } from './useNodesResource';
import { NodesContext } from './NodesContext';

export function NodesProvider({ children }: PropsWithChildren) {
  const value = useNodesResource();
  return <NodesContext.Provider value={value}>{children}</NodesContext.Provider>;
}
