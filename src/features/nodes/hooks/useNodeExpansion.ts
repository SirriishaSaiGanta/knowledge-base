import { useContext } from 'react';
import { NodeExpansionContext, type NodeExpansionResource } from './NodeExpansionContext';

export function useNodeExpansion(): NodeExpansionResource {
  const context = useContext(NodeExpansionContext);
  if (!context) throw new Error('useNodeExpansion must be used within a NodeExpansionProvider');
  return context;
}
