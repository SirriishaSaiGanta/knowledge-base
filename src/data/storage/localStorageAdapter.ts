import type { StorageAdapter } from './StorageAdapter';

/**
 * Reads/writes are wrapped in try/catch because localStorage can throw
 * (private browsing, quota exceeded, corrupted JSON) and a persistence
 * failure should never crash the UI.
 */
export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Swallow quota/serialization errors; the UI keeps working in-memory
      // for the current session even if persistence failed.
    }
  },

  remove(key: string): void {
    window.localStorage.removeItem(key);
  },

  clear(): void {
    window.localStorage.clear();
  },
};
