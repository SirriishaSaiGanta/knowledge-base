import { Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function RealWorldExampleView({ content, theme }: SectionViewProps<'realWorldExample'>) {
  return (
    <div className="example-grid">
      {content.examples.map((example) => (
        <div key={example.id} className="example-card">
          <div className="example-card-header">
            <span aria-hidden="true">{example.icon}</span>
            <strong>{example.title}</strong>
          </div>
          <Markdown theme={theme}>{example.description}</Markdown>
        </div>
      ))}
    </div>
  );
}
