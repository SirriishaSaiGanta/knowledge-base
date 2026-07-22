import { Textarea } from '@shared/components/ui';
import type { SectionEditProps } from './types';

export function DetailedExplanationEdit({ content, onChange }: SectionEditProps<'detailedExplanation'>) {
  return (
    <Textarea
      value={content}
      onChange={(event) => onChange(event.target.value)}
      rows={14}
      className="markdown-textarea"
    />
  );
}
