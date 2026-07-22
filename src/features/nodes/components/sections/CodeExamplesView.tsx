import { CodeBlock, Markdown } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function CodeExamplesView({ content, theme }: SectionViewProps<'codeExamples'>) {
  return (
    <div className="code-examples">
      {content.examples.map((example) => (
        <div key={example.id} className="code-example-card">
          {example.title.trim() && <h4>{example.title}</h4>}
          <CodeBlock code={example.code} language={example.language || 'text'} theme={theme} />
          {example.explanation.trim() && <Markdown theme={theme}>{example.explanation}</Markdown>}
        </div>
      ))}
    </div>
  );
}
