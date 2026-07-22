/**
 * Storage-agnostic contract every persistence backend must satisfy.
 * Features and repositories depend on this interface only, never on
 * `localStorage` directly, so the backend can change without touching
 * feature code.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
