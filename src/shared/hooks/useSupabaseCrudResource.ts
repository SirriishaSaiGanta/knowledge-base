import { useSyncExternalStore } from 'react';
import type { Identifiable, Timestamped } from '@shared/types/common';
import type { SupabaseRepository } from '@data/supabaseRepository';

export interface CrudResource<T extends Identifiable> {
  items: T[];
  create: (input: Omit<T, keyof Identifiable | keyof Timestamped>) => T;
  update: (id: string, patch: Partial<Omit<T, keyof Identifiable | keyof Timestamped>>) => void;
  remove: (id: string) => void;
}

/**
 * Thin reactive wrapper around a SupabaseRepository's cache — every feature's context provider
 * (TagsProvider, ...) is a thin wrapper around this hook. Assumes repository.init() has already
 * resolved (see AppProviders), so items is populated from first render instead of starting empty.
 */
export function useSupabaseCrudResource<T extends Identifiable & Timestamped>(
  repository: SupabaseRepository<T>,
): CrudResource<T> {
  const items = useSyncExternalStore(repository.subscribe, repository.getAll);

  return {
    items,
    create: repository.create,
    update: (id, patch) => {
      repository.update(id, patch);
    },
    remove: repository.remove,
  };
}
