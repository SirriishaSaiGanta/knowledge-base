import type { StorageAdapter } from './StorageAdapter';

/**
 * In-memory implementation of StorageAdapter. Useful for unit tests and as
 * a drop-in fallback when persistence isn't desired (e.g. a future
 * "incognito" mode).
 */
export function createMemoryAdapter(): StorageAdapter {
  const store = new Map<string, unknown>();

  return {
    get<T>(key: string): T | null {
      return store.has(key) ? (store.get(key) as T) : null;
    },
    set<T>(key: string, value: T): void {
      store.set(key, value);
    },
    remove(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
  };
}
