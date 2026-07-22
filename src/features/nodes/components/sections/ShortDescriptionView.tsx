import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function ShortDescriptionView({ content, theme }: SectionViewProps<'shortDescription'>) {
  return <Markdown theme={theme}>{content}</Markdown>;
}
