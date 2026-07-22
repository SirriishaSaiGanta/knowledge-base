import { Input, Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { SectionEditProps } from './types';

export function BestPracticesEdit({ content, onChange }: SectionEditProps<'bestPractices'>) {
  return (
    <RepeatableFieldList
      items={content.practices}
      onChange={(practices) => onChange({ practices })}
      createItem={() => ({ id: generateId(), recommendation: '', explanation: '', example: '' })}
      addLabel="+ Add best practice"
      emptyLabel="No best practices yet."
      renderItem={(practice, update) => (
        <>
          <Input
            value={practice.recommendation}
            onChange={(event) => update({ recommendation: event.target.value })}
            placeholder="Recommendation"
          />
          <Textarea
            value={practice.explanation}
            onChange={(event) => update({ explanation: event.target.value })}
            rows={3}
            placeholder="Explanation"
          />
          <Textarea
            value={practice.example}
            onChange={(event) => update({ example: event.target.value })}
            rows={3}
            className="markdown-textarea"
            placeholder="Example (optional, markdown/code)"
          />
        </>
      )}
    />
  );
}
