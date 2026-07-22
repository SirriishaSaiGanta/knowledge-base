import type { Identifiable, Timestamped } from '@shared/types/common';

export interface Tag extends Identifiable, Timestamped {
  name: string;
  color: string;
}

export type TagInput = Pick<Tag, 'name' | 'color'>;
