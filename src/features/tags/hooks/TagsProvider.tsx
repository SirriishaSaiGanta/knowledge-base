import type { PropsWithChildren } from 'react';
import { useCrudResource } from '@shared/hooks/useCrudResource';
import { tagsRepository } from '../api/tagsRepository';
import { TagsContext } from './TagsContext';

export function TagsProvider({ children }: PropsWithChildren) {
  const value = useCrudResource(tagsRepository);
  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
}
