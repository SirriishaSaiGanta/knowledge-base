import { Markdown } from '@shared/components/ui';
import type { RealWorldProblemContent } from '../../types/Section';
import type { SectionViewProps } from './types';

const FIELDS: { key: keyof RealWorldProblemContent; label: string }[] = [
  { key: 'problem', label: 'Problem' },
  { key: 'impact', label: 'Impact' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'solution', label: 'Solution' },
];

export function RealWorldProblemView({ content, theme }: SectionViewProps<'realWorldProblem'>) {
  const filled = FIELDS.filter((field) => content[field.key].trim());

  return (
    <div className="info-card">
      {filled.map((field) => (
        <div key={field.key} className="info-card-block">
          <span className="info-card-label">{field.label}</span>
          <Markdown theme={theme}>{content[field.key]}</Markdown>
        </div>
      ))}
    </div>
  );
}
