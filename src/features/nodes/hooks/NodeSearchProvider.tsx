import { useState, type PropsWithChildren } from 'react';
import { NodeSearchContext } from './NodeSearchContext';

export function NodeSearchProvider({ children }: PropsWithChildren) {
  const [query, setQuery] = useState('');
  return <NodeSearchContext.Provider value={{ query, setQuery }}>{children}</NodeSearchContext.Provider>;
}
