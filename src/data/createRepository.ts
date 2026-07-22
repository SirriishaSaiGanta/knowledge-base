import type { Identifiable, Timestamped } from '@shared/types/common';
import { generateId } from '@shared/utils/id';
import { nowIso } from '@shared/utils/date';
import type { StorageAdapter } from './storage/StorageAdapter';

export interface Repository<T extends Identifiable> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(input: Omit<T, keyof Identifiable | keyof Timestamped>): T;
  update(id: string, patch: Partial<Omit<T, keyof Identifiable | keyof Timestamped>>): T | undefined;
  remove(id: string): void;
}

/**
 * Generic CRUD over a single storage key. Every feature's api/ layer is a
 * thin call to this factory instead of hand-rolled JSON.parse/stringify —
 * see features/snippets/api/snippetsRepository.ts for a usage example.
 */
export function createRepository<T extends Identifiable & Timestamped>(
  key: string,
  adapter: StorageAdapter,
): Repository<T> {
  function readAll(): T[] {
    return adapter.get<T[]>(key) ?? [];
  }

  function writeAll(items: T[]): void {
    adapter.set(key, items);
  }

  return {
    getAll: readAll,

    getById(id) {
      return readAll().find((item) => item.id === id);
    },

    create(input) {
      const timestamp = nowIso();
      const entity = {
        ...input,
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      } as T;

      writeAll([...readAll(), entity]);
      return entity;
    },

    update(id, patch) {
      let updated: T | undefined;

      const items = readAll().map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...patch, updatedAt: nowIso() };
        return updated;
      });

      if (updated) writeAll(items);
      return updated;
    },

    remove(id) {
      writeAll(readAll().filter((item) => item.id !== id));
    },
  };
}
