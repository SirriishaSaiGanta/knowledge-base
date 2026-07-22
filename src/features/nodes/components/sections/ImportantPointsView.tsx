import { BulletListView } from './BulletListView';
import type { SectionViewProps } from './types';

export function ImportantPointsView({ content, theme }: SectionViewProps<'importantPoints'>) {
  return <BulletListView content={content} icon="✔" theme={theme} />;
}
