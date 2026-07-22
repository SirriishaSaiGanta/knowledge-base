import { Markdown } from '@shared/components/ui';
import type { BulletListContent } from '../../types/Section';

export interface BulletListViewProps {
  content: BulletListContent;
  icon: string;
  theme: 'light' | 'dark';
}

/** Shared by Important Points and Interview Points — identical "one line per point" rule, different icon. */
export function BulletListView({ content, icon, theme }: BulletListViewProps) {
  const points = content.points.filter((point) => point.trim());

  return (
    <ul className="bullet-list">
      {points.map((point, index) => (
        <li key={index} className="bullet-list-item">
          <span aria-hidden="true">{icon}</span>
          <Markdown theme={theme}>{point}</Markdown>
        </li>
      ))}
    </ul>
  );
}
