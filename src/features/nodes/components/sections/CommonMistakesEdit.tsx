import { Input, Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { SectionEditProps } from './types';

export function CommonMistakesEdit({ content, onChange }: SectionEditProps<'commonMistakes'>) {
  return (
    <RepeatableFieldList
      items={content.mistakes}
      onChange={(mistakes) => onChange({ mistakes })}
      createItem={() => ({ id: generateId(), mistake: '', whyWrong: '', correctApproach: '' })}
      addLabel="+ Add common mistake"
      emptyLabel="No common mistakes yet."
      renderItem={(mistake, update) => (
        <>
          <Input value={mistake.mistake} onChange={(event) => update({ mistake: event.target.value })} placeholder="Mistake" />
          <Textarea
            value={mistake.whyWrong}
            onChange={(event) => update({ whyWrong: event.target.value })}
            rows={3}
            placeholder="Why it's wrong"
          />
          <Textarea
            value={mistake.correctApproach}
            onChange={(event) => update({ correctApproach: event.target.value })}
            rows={3}
            placeholder="Correct approach"
          />
        </>
      )}
    />
  );
}
