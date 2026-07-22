import { Input, Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { Difficulty } from '../../types/Section';
import type { SectionEditProps } from './types';

export function InterviewQuestionsEdit({ content, onChange }: SectionEditProps<'interviewQuestions'>) {
  return (
    <RepeatableFieldList
      items={content.questions}
      onChange={(questions) => onChange({ questions })}
      createItem={() => ({ id: generateId(), question: '', answer: '', difficulty: 'basic' as Difficulty })}
      addLabel="+ Add interview question"
      emptyLabel="No interview questions yet."
      renderItem={(question, update) => (
        <>
          <Input value={question.question} onChange={(event) => update({ question: event.target.value })} placeholder="Question" />
          <select
            value={question.difficulty}
            onChange={(event) => update({ difficulty: event.target.value as Difficulty })}
          >
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <Textarea value={question.answer} onChange={(event) => update({ answer: event.target.value })} rows={4} placeholder="Answer" />
        </>
      )}
    />
  );
}
