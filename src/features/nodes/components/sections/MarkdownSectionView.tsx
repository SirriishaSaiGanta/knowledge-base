import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function MarkdownSectionView({ content, theme }: SectionViewProps<'markdown'>) {
  return <Markdown theme={theme}>{content.body}</Markdown>;
}
