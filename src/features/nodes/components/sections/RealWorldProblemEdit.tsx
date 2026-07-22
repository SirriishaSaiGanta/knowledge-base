import { Textarea } from '@shared/components/ui';
import type { RealWorldProblemContent } from '../../types/Section';
import type { SectionEditProps } from './types';

const FIELDS: { key: keyof RealWorldProblemContent; label: string }[] = [
  { key: 'problem', label: 'Problem' },
  { key: 'impact', label: 'Impact' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'solution', label: 'Solution' },
];

export function RealWorldProblemEdit({ content, onChange }: SectionEditProps<'realWorldProblem'>) {
  return (
    <div className="structured-fields">
      {FIELDS.map((field) => (
        <label key={field.key}>
          {field.label}
          <Textarea
            value={content[field.key]}
            onChange={(event) => onChange({ ...content, [field.key]: event.target.value })}
            rows={3}
          />
        </label>
      ))}
    </div>
  );
}
