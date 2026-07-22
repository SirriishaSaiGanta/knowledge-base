import { useState } from 'react';
import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function InterviewQuestionsView({ content, theme }: SectionViewProps<'interviewQuestions'>) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="accordion">
      {content.questions.map((question) => {
        const isOpen = openId === question.id;
        return (
          <div key={question.id} className="accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : question.id)}
            >
              <span className={`difficulty-badge difficulty-${question.difficulty}`}>{question.difficulty}</span>
              <span className="accordion-question">{question.question}</span>
              <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="accordion-panel">
                <Markdown theme={theme}>{question.answer}</Markdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
