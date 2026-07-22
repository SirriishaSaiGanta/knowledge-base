import { BulletListView } from './BulletListView';
import type { SectionViewProps } from './types';

export function InterviewPointsView({ content, theme }: SectionViewProps<'interviewPoints'>) {
  return <BulletListView content={content} icon="💡" theme={theme} />;
}
