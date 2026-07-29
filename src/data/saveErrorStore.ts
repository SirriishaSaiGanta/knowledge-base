import { generateId } from '@shared/utils/id';

export interface SaveError {
  id: string;
  message: string;
}

/**
 * Surfaces save failures to the UI instead of only console.error — a write that fails silently is
 * exactly what caused topics to vanish before (see supabaseRepository's enqueueWrite): it looked
 * fine in the session that made the change and only turned out to be missing on a later, fresh
 * load. Errors stay until dismissed rather than auto-expiring, since "the user didn't happen to be
 * looking at the corner of the screen right then" shouldn't mean they never find out a save failed.
 */
let errors: SaveError[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const saveErrorStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getAll: () => errors,

  report(message: string) {
    errors = [...errors, { id: generateId(), message }];
    notify();
  },

  dismiss(id: string) {
    errors = errors.filter((error) => error.id !== id);
    notify();
  },
};
