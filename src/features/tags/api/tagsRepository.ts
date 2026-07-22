import { createRepository } from '@data/createRepository';
import { localStorageAdapter } from '@data/storage/localStorageAdapter';
import type { Tag } from '../types/Tag';

export const tagsRepository = createRepository<Tag>('kb:tags', localStorageAdapter);
