import { createContext } from 'react';

export interface NodeSearchResource {
  query: string;
  setQuery: (query: string) => void;
}

export const NodeSearchContext = createContext<NodeSearchResource | undefined>(undefined);
