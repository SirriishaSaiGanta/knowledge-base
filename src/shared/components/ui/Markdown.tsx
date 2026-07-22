import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

export interface MarkdownProps {
  children: string;
  theme?: 'light' | 'dark';
}

export function Markdown({ children, theme = 'light' }: MarkdownProps) {
  const components: Components = {
    code(props) {
      const { className, children: codeChildren } = props;
      const match = /language-(\w+)/.exec(className ?? '');
      const text = String(codeChildren).replace(/\n$/, '');
      const isBlock = Boolean(match) || text.includes('\n');

      if (!isBlock) {
        return <code className="markdown-inline-code">{codeChildren}</code>;
      }

      return <CodeBlock code={text} language={match?.[1] ?? 'text'} theme={theme} />;
    },
    table(props) {
      return (
        <div className="markdown-table-wrapper">
          <table {...props} />
        </div>
      );
    },
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
