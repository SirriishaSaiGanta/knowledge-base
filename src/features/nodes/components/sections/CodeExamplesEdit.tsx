import { Input, Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { SectionEditProps } from './types';

export function CodeExamplesEdit({ content, onChange }: SectionEditProps<'codeExamples'>) {
  return (
    <RepeatableFieldList
      items={content.examples}
      onChange={(examples) => onChange({ examples })}
      createItem={() => ({ id: generateId(), title: '', language: 'text', code: '', explanation: '' })}
      addLabel="+ Add code example"
      emptyLabel="No code examples yet."
      renderItem={(example, update) => (
        <>
          <Input
            value={example.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Title (optional)"
          />
          <Input
            value={example.language}
            onChange={(event) => update({ language: event.target.value })}
            placeholder="Language (e.g. typescript, sql, csharp)"
          />
          <Textarea
            value={example.code}
            onChange={(event) => update({ code: event.target.value })}
            rows={8}
            className="markdown-textarea"
            placeholder="Code"
          />
          <Textarea
            value={example.explanation}
            onChange={(event) => update({ explanation: event.target.value })}
            rows={2}
            placeholder="Explanation (optional)"
          />
        </>
      )}
    />
  );
}
