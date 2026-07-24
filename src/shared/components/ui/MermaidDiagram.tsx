import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

export interface MermaidDiagramProps {
  code: string;
  theme?: 'light' | 'dark';
}

export function MermaidDiagram({ code, theme = 'light' }: MermaidDiagramProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'strict' });

    mermaid
      .render(`mermaid-${rawId}`, code)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to render diagram');
      });

    return () => {
      cancelled = true;
    };
  }, [code, theme, rawId]);

  if (error) {
    return (
      <div className="mermaid-error">
        <p>Couldn&apos;t render this diagram{error ? `: ${error}` : '.'}</p>
      </div>
    );
  }

  if (!svg) return <div className="mermaid-loading">Rendering diagram…</div>;

  // mermaid's own output, sanitized internally via securityLevel: 'strict' — the standard pattern
  // for embedding its generated SVG.
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
