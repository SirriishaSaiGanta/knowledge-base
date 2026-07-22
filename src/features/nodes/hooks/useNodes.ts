import { useContext } from 'react';
import type { NodesResource } from './useNodesResource';
import { NodesContext } from './NodesContext';

export function useNodes(): NodesResource {
  const context = useContext(NodesContext);
  if (!context) throw new Error('useNodes must be used within a NodesProvider');
  return context;
}
