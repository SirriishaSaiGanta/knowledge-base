import { Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { SectionEditProps } from './types';

export function ScenarioQuestionsEdit({ content, onChange }: SectionEditProps<'scenarioQuestions'>) {
  return (
    <RepeatableFieldList
      items={content.scenarios}
      onChange={(scenarios) => onChange({ scenarios })}
      createItem={() => ({ id: generateId(), question: '', answer: '', why: '' })}
      addLabel="+ Add scenario"
      emptyLabel="No scenario questions yet."
      renderItem={(scenario, update) => (
        <>
          <Textarea
            value={scenario.question}
            onChange={(event) => update({ question: event.target.value })}
            rows={2}
            placeholder="Scenario / question"
          />
          <Textarea value={scenario.answer} onChange={(event) => update({ answer: event.target.value })} rows={3} placeholder="Answer" />
          <Textarea
            value={scenario.why}
            onChange={(event) => update({ why: event.target.value })}
            rows={2}
            placeholder="Why this answer (optional)"
          />
        </>
      )}
    />
  );
}
