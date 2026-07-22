import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function BestPracticesView({ content, theme }: SectionViewProps<'bestPractices'>) {
  return (
    <div className="practice-list">
      {content.practices.map((practice) => (
        <div key={practice.id} className="success-card">
          <h4 className="success-card-title">
            <span aria-hidden="true">✔</span> {practice.recommendation}
          </h4>
          {practice.explanation.trim() && <Markdown theme={theme}>{practice.explanation}</Markdown>}
          {practice.example.trim() && <Markdown theme={theme}>{practice.example}</Markdown>}
        </div>
      ))}
    </div>
  );
}
