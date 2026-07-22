import { createContext } from 'react';
import type { NodesResource } from './useNodesResource';

export const NodesContext = createContext<NodesResource | undefined>(undefined);
