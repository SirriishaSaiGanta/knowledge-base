import { Markdown } from '@shared/components/ui';
import type { WhyIntroducedContent } from '../../types/Section';
import type { SectionViewProps } from './types';

const STAGES: { key: keyof WhyIntroducedContent; label: string }[] = [
  { key: 'problem', label: 'Problem' },
  { key: 'limitations', label: 'Limitations' },
  { key: 'solution', label: 'Solution' },
  { key: 'benefits', label: 'Benefits' },
];

export function WhyIntroducedView({ content, theme }: SectionViewProps<'whyIntroduced'>) {
  const stages = STAGES.filter((stage) => content[stage.key].trim());

  return (
    <div className="timeline">
      {stages.map((stage, index) => (
        <div key={stage.key} className="timeline-stage">
          <div className="timeline-stage-card">
            <span className="timeline-stage-label">{stage.label}</span>
            <Markdown theme={theme}>{content[stage.key]}</Markdown>
          </div>
          {index < stages.length - 1 && (
            <span className="timeline-arrow" aria-hidden="true">
              ↓
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
