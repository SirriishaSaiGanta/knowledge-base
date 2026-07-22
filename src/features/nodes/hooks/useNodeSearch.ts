import { useContext } from 'react';
import { NodeSearchContext, type NodeSearchResource } from './NodeSearchContext';

export function useNodeSearch(): NodeSearchResource {
  const context = useContext(NodeSearchContext);
  if (!context) throw new Error('useNodeSearch must be used within a NodeSearchProvider');
  return context;
}
