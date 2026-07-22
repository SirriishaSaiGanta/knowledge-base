import { Button, Input } from '@shared/components/ui';
import type { BulletListContent } from '../../types/Section';

export interface BulletListEditProps {
  content: BulletListContent;
  onChange: (content: BulletListContent) => void;
  placeholder?: string;
}

export function BulletListEdit({ content, onChange, placeholder }: BulletListEditProps) {
  function updatePoint(index: number, value: string) {
    const points = [...content.points];
    points[index] = value;
    onChange({ points });
  }

  function removePoint(index: number) {
    onChange({ points: content.points.filter((_, i) => i !== index) });
  }

  return (
    <div className="bullet-list-editor">
      {content.points.map((point, index) => (
        <div key={index} className="bullet-list-editor-row">
          <Input value={point} onChange={(event) => updatePoint(index, event.target.value)} placeholder={placeholder} />
          <Button type="button" variant="ghost" onClick={() => removePoint(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => onChange({ points: [...content.points, ''] })}>
        + Add point
      </Button>
    </div>
  );
}
