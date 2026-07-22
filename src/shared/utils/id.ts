import type { ID } from '@shared/types/common';

export function generateId(): ID {
  return crypto.randomUUID();
}
