import { BulletListEdit } from './BulletListEdit';
import type { SectionEditProps } from './types';

export function InterviewPointsEdit({ content, onChange }: SectionEditProps<'interviewPoints'>) {
  return <BulletListEdit content={content} onChange={onChange} placeholder="e.g. Explain the difference between var and let" />;
}
