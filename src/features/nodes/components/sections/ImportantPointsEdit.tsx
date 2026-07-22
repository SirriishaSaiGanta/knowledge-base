import { BulletListEdit } from './BulletListEdit';
import type { SectionEditProps } from './types';

export function ImportantPointsEdit({ content, onChange }: SectionEditProps<'importantPoints'>) {
  return <BulletListEdit content={content} onChange={onChange} placeholder="e.g. DbContext is not thread safe" />;
}
