import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function CommonMistakesView({ content, theme }: SectionViewProps<'commonMistakes'>) {
  return (
    <div className="mistake-list">
      {content.mistakes.map((mistake) => (
        <div key={mistake.id} className="warning-card">
          <h4 className="warning-card-title">
            <span aria-hidden="true">⚠</span> {mistake.mistake}
          </h4>
          {mistake.whyWrong.trim() && (
            <div className="warning-card-block">
              <span className="warning-card-label">Why it&apos;s wrong</span>
              <Markdown theme={theme}>{mistake.whyWrong}</Markdown>
            </div>
          )}
          {mistake.correctApproach.trim() && (
            <div className="warning-card-block">
              <span className="warning-card-label">Correct approach</span>
              <Markdown theme={theme}>{mistake.correctApproach}</Markdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
