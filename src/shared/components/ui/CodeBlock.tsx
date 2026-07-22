import { useState } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';

export interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: 'light' | 'dark';
  collapsedLineThreshold?: number;
}

export function CodeBlock({ code, language = 'text', theme = 'light', collapsedLineThreshold = 15 }: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const normalized = code.replace(/\n$/, '');
  const lines = normalized.split('\n');
  const isLong = lines.length > collapsedLineThreshold;
  const visible = isLong && !isExpanded ? lines.slice(0, collapsedLineThreshold).join('\n') : normalized;

  async function handleCopy() {
    await navigator.clipboard.writeText(normalized);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-language">{language}</span>
        <button type="button" className="code-block-copy" onClick={handleCopy}>
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <Highlight code={visible} language={language as Language} theme={theme === 'dark' ? themes.vsDark : themes.github}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`code-block-pre ${className}`} style={style}>
            {tokens.map((line, lineIndex) => (
              <div key={lineIndex} {...getLineProps({ line })} className="code-block-line">
                <span className="code-block-line-number">{lineIndex + 1}</span>
                <span className="code-block-line-content">
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      {isLong && (
        <button type="button" className="code-block-toggle" onClick={() => setIsExpanded((value) => !value)}>
          {isExpanded ? 'Collapse' : `Show ${lines.length - collapsedLineThreshold} more lines`}
        </button>
      )}
    </div>
  );
}
