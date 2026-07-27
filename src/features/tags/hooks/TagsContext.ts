import { createContext } from 'react';
import type { CrudResource } from '@shared/hooks/useSupabaseCrudResource';
import type { Tag } from '../types/Tag';

export const TagsContext = createContext<CrudResource<Tag> | undefined>(undefined);
