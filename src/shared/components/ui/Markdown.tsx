import { useEffect, useState, type MouseEvent } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';

export interface MarkdownProps {
  children: string;
  theme?: 'light' | 'dark';
}

export function Markdown({ children, theme = 'light' }: MarkdownProps) {
  const [zoomedSrc, setZoomedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!zoomedSrc) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setZoomedSrc(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedSrc]);

  const components: Components = {
    code(props) {
      const { className, children: codeChildren } = props;
      const match = /language-(\w+)/.exec(className ?? '');
      const language = match?.[1];
      const text = String(codeChildren).replace(/\n$/, '');
      const isBlock = Boolean(match) || text.includes('\n');

      if (!isBlock) {
        return <code className="markdown-inline-code">{codeChildren}</code>;
      }

      if (language === 'mermaid') {
        return <MermaidDiagram code={text} theme={theme} />;
      }

      return <CodeBlock code={text} language={language ?? 'text'} theme={theme} />;
    },
    table(props) {
      return (
        <div className="markdown-table-wrapper">
          <table {...props} />
        </div>
      );
    },
    a({ href, children: linkChildren, ...rest }) {
      const isExternal = /^https?:\/\//i.test(href ?? '');
      return (
        <a href={href} {...rest} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {linkChildren}
        </a>
      );
    },
    img({ src, alt }) {
      if (!src) return null;
      return (
        <img
          src={src}
          alt={alt ?? ''}
          className="markdown-image"
          onClick={() => setZoomedSrc(String(src))}
        />
      );
    },
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>
        {children}
      </ReactMarkdown>

      {zoomedSrc && (
        <div className="image-lightbox" onClick={() => setZoomedSrc(null)}>
          <img src={zoomedSrc} alt="" onClick={(event: MouseEvent) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
