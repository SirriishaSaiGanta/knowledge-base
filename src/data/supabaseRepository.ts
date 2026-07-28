import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Identifiable, Timestamped } from '@shared/types/common';
import { generateId } from '@shared/utils/id';
import { nowIso } from '@shared/utils/date';
import { supabase } from './supabaseClient';

export interface Repository<T extends Identifiable> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(input: Omit<T, keyof Identifiable | keyof Timestamped>): T;
  update(id: string, patch: Partial<Omit<T, keyof Identifiable | keyof Timestamped>>): T | undefined;
  remove(id: string): void;
}

export interface SupabaseRepository<T extends Identifiable> extends Repository<T> {
  /** Fetches the initial snapshot and starts the realtime subscription. Safe to call more than
   *  once — later calls return the same in-flight/completed promise. */
  init(): Promise<void>;
  /** Notified whenever the in-memory cache changes, whether from a local mutation or a realtime
   *  event pushed from another device — this is what lets React state track the cache without
   *  polling. Pair with useSyncExternalStore. */
  subscribe(listener: () => void): () => void;
  /** Inserts entities with their id/timestamps preserved as-is, instead of generating new ones —
   *  used only for the one-time local-data migration, where existing cross-references (a node's
   *  parentId, a section's tagIds) must keep pointing at the same ids. */
  importRaw(entities: T[]): Promise<void>;
  /** Drops the cached snapshot and realtime subscription and forgets that init() ever ran, so the
   *  next init() re-fetches from scratch. Row Level Security already stops one signed-in user from
   *  reading another's rows over the network — this is about the *client-side cache*, which is a
   *  plain module-level singleton and therefore outlives any single user's session. Without
   *  resetting it, logging out and back in as someone else in the same tab would keep showing the
   *  previous account's topics until a hard refresh. Call on every sign-out. */
  reset(): void;
}

/**
 * Backs a Repository with a Supabase table instead of localStorage. Reads/writes go through an
 * in-memory cache that's populated by an initial fetch and then kept live by a Realtime
 * subscription — so getAll()/getById() stay synchronous (nothing downstream has to change to
 * handle promises) while still reflecting changes made from other devices.
 *
 * Mutations update the cache immediately (optimistic) and fire the Supabase request in the
 * background; a failure is logged rather than rolled back; unlikely for a single-user app and
 * not worth the complexity of reconciling a rollback against a cache that Realtime may have
 * already moved on from.
 */
export function createSupabaseRepository<T extends Identifiable & Timestamped>(
  table: string,
  toRow: (entity: T) => Record<string, unknown>,
  fromRow: (row: Record<string, unknown>) => T,
): SupabaseRepository<T> {
  let cache: T[] = [];
  let initPromise: Promise<void> | null = null;
  let channel: RealtimeChannel | null = null;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function upsertLocal(entity: T) {
    const index = cache.findIndex((item) => item.id === entity.id);
    cache = index === -1 ? [...cache, entity] : cache.map((item, i) => (i === index ? entity : item));
  }

  function removeLocal(id: string) {
    cache = cache.filter((item) => item.id !== id);
  }

  function init() {
    if (!initPromise) {
      initPromise = (async () => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        cache = (data ?? []).map(fromRow);
        notify();

        channel = supabase
          .channel(`${table}-changes-${crypto.randomUUID()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
            if (payload.eventType === 'DELETE') {
              removeLocal((payload.old as Record<string, unknown>).id as string);
            } else {
              upsertLocal(fromRow(payload.new as Record<string, unknown>));
            }
            notify();
          })
          .subscribe();
      })();
    }
    return initPromise;
  }

  return {
    init,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getAll: () => cache,

    getById: (id) => cache.find((item) => item.id === id),

    create(input) {
      const timestamp = nowIso();
      const entity = { ...input, id: generateId(), createdAt: timestamp, updatedAt: timestamp } as T;
      upsertLocal(entity);
      notify();
      void supabase
        .from(table)
        .insert(toRow(entity))
        .then(({ error }) => {
          if (error) console.error(`Failed to save to ${table}:`, error.message);
        });
      return entity;
    },

    update(id, patch) {
      const current = cache.find((item) => item.id === id);
      if (!current) return undefined;
      const updated = { ...current, ...patch, updatedAt: nowIso() } as T;
      upsertLocal(updated);
      notify();
      void supabase
        .from(table)
        .update(toRow(updated))
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error(`Failed to update ${table}:`, error.message);
        });
      return updated;
    },

    remove(id) {
      removeLocal(id);
      notify();
      void supabase
        .from(table)
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete from ${table}:`, error.message);
        });
    },

    async importRaw(entities) {
      if (entities.length === 0) return;
      entities.forEach(upsertLocal);
      notify();
      const { error } = await supabase.from(table).insert(entities.map(toRow));
      if (error) console.error(`Failed to import into ${table}:`, error.message);
    },

    reset() {
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
      cache = [];
      initPromise = null;
      notify();
    },
  };
}
