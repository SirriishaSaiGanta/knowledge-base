import type { PropsWithChildren } from 'react';
import { useSupabaseCrudResource } from '@shared/hooks/useSupabaseCrudResource';
import { tagsRepository } from '../api/tagsRepository';
import { TagsContext } from './TagsContext';

export function TagsProvider({ children }: PropsWithChildren) {
  const value = useSupabaseCrudResource(tagsRepository);
  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
}
