import { Input, Textarea } from '@shared/components/ui';
import type { SectionEditProps } from './types';

export function MarkdownSectionEdit({ content, onChange }: SectionEditProps<'markdown'>) {
  return (
    <div className="structured-fields">
      <label>
        Section title
        <Input
          value={content.title}
          onChange={(event) => onChange({ ...content, title: event.target.value })}
          placeholder="e.g. Constructor Injection"
        />
      </label>
      <label>
        Content
        <Textarea
          value={content.body}
          onChange={(event) => onChange({ ...content, body: event.target.value })}
          rows={14}
          className="markdown-textarea"
        />
      </label>
    </div>
  );
}
