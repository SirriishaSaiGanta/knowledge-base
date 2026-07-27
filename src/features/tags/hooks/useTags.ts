import { useContext } from 'react';
import type { CrudResource } from '@shared/hooks/useSupabaseCrudResource';
import type { Tag } from '../types/Tag';
import { TagsContext } from './TagsContext';

export function useTags(): CrudResource<Tag> {
  const context = useContext(TagsContext);
  if (!context) throw new Error('useTags must be used within a TagsProvider');
  return context;
}
