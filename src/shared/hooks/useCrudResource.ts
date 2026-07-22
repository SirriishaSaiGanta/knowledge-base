import { useCallback, useState } from 'react';
import type { Identifiable, Timestamped } from '@shared/types/common';
import type { Repository } from '@data/createRepository';

export interface CrudResource<T extends Identifiable> {
  items: T[];
  create: (input: Omit<T, keyof Identifiable | keyof Timestamped>) => T;
  update: (id: string, patch: Partial<Omit<T, keyof Identifiable | keyof Timestamped>>) => void;
  remove: (id: string) => void;
}

/**
 * Loads a repository's items into React state once, then keeps state and
 * storage in sync on every mutation. Every feature's context provider
 * (SnippetsProvider, NotesProvider, TagsProvider, ...) is a thin wrapper
 * around this hook — it's what they'd otherwise all reimplement with
 * useReducer.
 */
export function useCrudResource<T extends Identifiable & Timestamped>(
  repository: Repository<T>,
): CrudResource<T> {
  const [items, setItems] = useState<T[]>(() => repository.getAll());

  const create = useCallback(
    (input: Omit<T, keyof Identifiable | keyof Timestamped>) => {
      const entity = repository.create(input);
      setItems((current) => [...current, entity]);
      return entity;
    },
    [repository],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<T, keyof Identifiable | keyof Timestamped>>) => {
      const updated = repository.update(id, patch);
      if (!updated) return;
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    },
    [repository],
  );

  const remove = useCallback(
    (id: string) => {
      repository.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [repository],
  );

  return { items, create, update, remove };
}
