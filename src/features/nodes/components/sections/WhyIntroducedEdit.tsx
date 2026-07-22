import { Textarea } from '@shared/components/ui';
import type { WhyIntroducedContent } from '../../types/Section';
import type { SectionEditProps } from './types';

const FIELDS: { key: keyof WhyIntroducedContent; label: string }[] = [
  { key: 'problem', label: 'Problem' },
  { key: 'limitations', label: 'Limitations' },
  { key: 'solution', label: 'Solution' },
  { key: 'benefits', label: 'Benefits' },
];

export function WhyIntroducedEdit({ content, onChange }: SectionEditProps<'whyIntroduced'>) {
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
