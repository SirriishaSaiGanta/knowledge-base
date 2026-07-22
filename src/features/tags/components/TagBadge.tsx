import { Badge } from '@shared/components/ui';
import type { Tag } from '../types/Tag';

export function TagBadge({ tag }: { tag: Tag }) {
  return <Badge color={tag.color}>{tag.name}</Badge>;
}
