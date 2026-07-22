import { Textarea } from '@shared/components/ui';
import type { SectionEditProps } from './types';

export function ShortDescriptionEdit({ content, onChange }: SectionEditProps<'shortDescription'>) {
  return <Textarea value={content} onChange={(event) => onChange(event.target.value)} rows={5} />;
}
