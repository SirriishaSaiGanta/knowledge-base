import { useState } from 'react';
import { Button, Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function ScenarioQuestionsView({ content, theme }: SectionViewProps<'scenarioQuestions'>) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  function reveal(id: string) {
    setRevealedIds((current) => new Set(current).add(id));
  }

  return (
    <div className="scenario-list">
      {content.scenarios.map((scenario) => {
        const isRevealed = revealedIds.has(scenario.id);
        return (
          <div key={scenario.id} className="scenario-card">
            <Markdown theme={theme}>{scenario.question}</Markdown>
            {!isRevealed ? (
              <>
                <p className="scenario-hint">Think it through yourself first.</p>
                <Button type="button" variant="secondary" onClick={() => reveal(scenario.id)}>
                  Reveal Answer
                </Button>
              </>
            ) : (
              <div className="scenario-answer">
                <Markdown theme={theme}>{scenario.answer}</Markdown>
                {scenario.why.trim() && (
                  <div className="scenario-why">
                    <span className="scenario-why-label">Why this answer</span>
                    <Markdown theme={theme}>{scenario.why}</Markdown>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
