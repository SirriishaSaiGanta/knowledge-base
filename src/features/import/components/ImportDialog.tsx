import { useMemo, useState, type ChangeEvent } from 'react';
import { Button, Input, Modal, Textarea } from '@shared/components/ui';
import type { ID } from '@shared/types/common';
import {
  useNodes,
  parseImportPayload,
  parseMarkdownImport,
  parseNamesOnlyImport,
  importTree,
  flattenTree,
  type ImportNode,
  type ImportValidationError,
  type ImportSummary,
  type ConflictStrategy,
} from '@features/nodes';
import { useTags, randomTagColor } from '@features/tags';
import { ImportPreviewTree } from './ImportPreviewTree';

export interface ImportDialogProps {
  open: boolean;
  /** Preselected destination when the dialog opens; the user can change it before importing. */
  defaultParentId?: ID | null;
  onClose: () => void;
}

type ImportFormat = 'markdown' | 'json';
type ContentMode = 'full' | 'namesOnly';

const TOP_LEVEL_HEADINGS = [
  'Description',
  'Detailed Explanation',
  'Why Introduced',
  'Real-world Problem',
  'Real-world Example',
  'Code Example',
  'Important Points',
  'Best Practices',
  'Common Mistakes',
  'Interview Points',
  'Interview Questions',
  'Scenario Questions',
  'References',
];

/** Existing children of the chosen destination are pre-listed as `##` names, so the AI (or you) can see
 *  what's already there and add new ones without duplicating — re-importing over an existing name is a
 *  no-op by default (skip strategy), not a duplicate. */
function buildMarkdownTemplate(existingChildNames: string[]): string {
  const lines: string[] = [];
  for (const heading of TOP_LEVEL_HEADINGS) {
    lines.push(`# ${heading}`, '');
  }
  lines.push('# Children');
  for (const name of existingChildNames) {
    lines.push(`## ${name}`);
  }
  lines.push('');
  return lines.join('\n');
}

/** No "# Children" wrapper needed — the whole document is the outline, existing names included at the top level. */
function buildNamesOnlyTemplate(existingChildNames: string[]): string {
  const lines: string[] = [];
  for (const name of existingChildNames) {
    lines.push(`# ${name}`);
  }
  if (existingChildNames.length > 0) lines.push('');
  lines.push('# Example Topic', '## Example Subtopic', '### Example Sub-subtopic', '');
  return lines.join('\n');
}

export function ImportDialog({ open, defaultParentId = null, onClose }: ImportDialogProps) {
  const { nodes, tree, createNode, addSection } = useNodes();
  const tags = useTags();

  const [format, setFormat] = useState<ImportFormat>('markdown');
  const [contentMode, setContentMode] = useState<ContentMode>('full');
  const [title, setTitle] = useState('');
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<ImportNode | null>(null);
  const [errors, setErrors] = useState<ImportValidationError[]>([]);
  const [parentId, setParentId] = useState<ID | null>(defaultParentId);
  const [strategy, setStrategy] = useState<ConflictStrategy>('skip');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const destinations = useMemo(() => flattenTree(tree), [tree]);

  function reset() {
    setTitle('');
    setRaw('');
    setParsed(null);
    setErrors([]);
    setParentId(defaultParentId);
    setSummary(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ''));
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleInsertTemplate() {
    const existingChildNames = nodes.filter((node) => node.parentId === parentId).map((node) => node.title);
    setRaw(
      contentMode === 'full'
        ? buildMarkdownTemplate(existingChildNames)
        : buildNamesOnlyTemplate(existingChildNames),
    );
  }

  function handleValidate() {
    if (format === 'json') {
      const result = parseImportPayload(raw);
      setParsed(result.node);
      setErrors(result.errors);
    } else {
      if (!title.trim()) {
        setParsed(null);
        setErrors([{ path: 'title', message: 'Title is required for markdown imports' }]);
        return;
      }
      setParsed(contentMode === 'full' ? parseMarkdownImport(title, raw) : parseNamesOnlyImport(title, raw));
      setErrors([]);
    }
    setSummary(null);
  }

  function resolveTagIds(names: string[]): ID[] {
    return names.map((name) => {
      const trimmed = name.trim();
      const existing = tags.items.find((tag) => tag.name.toLowerCase() === trimmed.toLowerCase());
      return existing ? existing.id : tags.create({ name: trimmed, color: randomTagColor() }).id;
    });
  }

  function findChildByTitle(pid: ID | null, childTitle: string) {
    const normalized = childTitle.trim().toLowerCase();
    return nodes.find((node) => node.parentId === pid && node.title.trim().toLowerCase() === normalized);
  }

  function handleImport() {
    if (!parsed) return;
    const order = nodes.filter((node) => node.parentId === parentId).length;
    const result = importTree(
      parsed,
      parentId,
      order,
      { createNode, addSection, resolveTagIds, findChildByTitle },
      strategy,
    );
    setSummary(result);
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import topics">
      <div className="import-dialog">
        <fieldset className="import-destination">
          <legend>Import into</legend>
          <div className="import-destination-options">
            <label className="import-destination-option">
              <input
                type="radio"
                name="import-destination"
                checked={parentId === null}
                onChange={() => setParentId(null)}
              />
              Root
            </label>
            {destinations.map((option) => (
              <label key={option.id} className="import-destination-option" style={{ paddingLeft: option.depth * 16 }}>
                <input
                  type="radio"
                  name="import-destination"
                  checked={parentId === option.id}
                  onChange={() => setParentId(option.id)}
                />
                {option.title}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          If a topic already exists there
          <select value={strategy} onChange={(event) => setStrategy(event.target.value as ConflictStrategy)}>
            <option value="skip">Skip it (keep existing)</option>
            <option value="replace" disabled>
              Replace it (coming soon)
            </option>
            <option value="merge" disabled>
              Merge into it (coming soon)
            </option>
          </select>
        </label>

        <div className="import-format-switcher" role="tablist" aria-label="Import format">
          <button
            type="button"
            role="tab"
            aria-selected={format === 'markdown'}
            className={format === 'markdown' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setFormat('markdown')}
          >
            Markdown
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={format === 'json'}
            className={format === 'json' ? 'mode-tab active' : 'mode-tab'}
            onClick={() => setFormat('json')}
          >
            JSON
          </button>
        </div>

        {format === 'markdown' ? (
          <div className="import-source">
            <label>
              What are you adding?
              <select value={contentMode} onChange={(event) => setContentMode(event.target.value as ContentMode)}>
                <option value="full">Full topic (content sections + children)</option>
                <option value="namesOnly">Just topic names (outline only, no content)</option>
              </select>
            </label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Topic title" />
            <div className="import-source-toolbar">
              <Button type="button" variant="ghost" onClick={handleInsertTemplate}>
                Insert {contentMode === 'full' ? 'heading' : 'example'} template
              </Button>
            </div>
            <Textarea
              rows={12}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder={
                contentMode === 'full'
                  ? 'Paste markdown here, using the documented headings (# Description, # Detailed Explanation, ...)'
                  : 'Paste a nested outline of topic names here — just headings, e.g. "# Topic" / "## Subtopic"'
              }
              className="import-json-input"
            />
          </div>
        ) : (
          <div className="import-source">
            <input type="file" accept="application/json" onChange={handleFileChange} />
            <Textarea
              rows={12}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder="Paste JSON here, or upload a .json file above"
              className="import-json-input"
            />
          </div>
        )}

        <Button type="button" variant="secondary" onClick={handleValidate} disabled={!raw.trim()}>
          Validate
        </Button>

        {errors.length > 0 && (
          <ul className="import-errors">
            {errors.map((error, index) => (
              <li key={index}>
                <strong>{error.path}</strong>: {error.message}
              </li>
            ))}
          </ul>
        )}

        {parsed && (
          <>
            <h3>Preview</h3>
            <ul className="import-preview-tree">
              <ImportPreviewTree node={parsed} />
            </ul>

            <Button type="button" onClick={handleImport}>
              Import
            </Button>
          </>
        )}

        {summary && (
          <p className="import-summary">
            Created {summary.created} topic{summary.created === 1 ? '' : 's'}
            {summary.skipped > 0 ? `, skipped ${summary.skipped} that already existed.` : '.'}
          </p>
        )}
      </div>
    </Modal>
  );
}
