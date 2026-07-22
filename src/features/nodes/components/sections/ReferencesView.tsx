import { Badge } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function ReferencesView({ content }: SectionViewProps<'references'>) {
  return (
    <ul className="reference-list">
      {content.items.map((item) => (
        <li key={item.id} className="reference-item">
          <div className="reference-item-header">
            <strong>{item.title}</strong>
            {item.source.trim() && <Badge>{item.source}</Badge>}
          </div>
          {item.description.trim() && <p className="reference-description">{item.description}</p>}
          {item.url.trim() && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary reference-link">
              Open link ↗
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
