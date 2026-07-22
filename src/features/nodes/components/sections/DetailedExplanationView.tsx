import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function DetailedExplanationView({ content, theme }: SectionViewProps<'detailedExplanation'>) {
  return <Markdown theme={theme}>{content}</Markdown>;
}
