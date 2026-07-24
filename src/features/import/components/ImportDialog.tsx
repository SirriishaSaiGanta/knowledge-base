import { useMemo, useState, type ChangeEvent } from 'react';
import { Button, Input, Modal, Textarea } from '@shared/components/ui';
import type { ID } from '@shared/types/common';
import {
  useNodes,
  parseImportPayload,
  parseMarkdownImport,
  parseNamesOnlyImport,
  importTree,
  importIntoNode,
  flattenTree,
  type ImportNode,
  type ImportValidationError,
  type ImportSummary,
  type ConflictStrategy,
  type KnowledgeNode,
} from '@features/nodes';
import { useTags, randomTagColor } from '@features/tags';
import { ImportPreviewTree } from './ImportPreviewTree';

export interface ImportDialogProps {
  open: boolean;
  /** Preselected destination when the dialog opens; the user can change it before importing (unless locked). */
  defaultParentId?: ID | null;
  /** When true, the destination picker and conflict-strategy option are hidden — imports always target defaultParentId. */
  lockDestination?: boolean;
  /** When set, pasted content is added/replaced directly on this existing node instead of creating a new one
   *  — used for "Import here" on a topic's own page. Hides the Title field, destination picker, and conflict
   *  strategy, since none of those apply when the target is already known. */
  targetNode?: KnowledgeNode;
  onClose: () => void;
}

type ImportFormat = 'markdown' | 'json';
type ContentMode = 'full' | 'namesOnly';

/** Existing children of the chosen destination are pre-listed under "# Children", so the AI (or you)
 *  can see what's already there and add new ones without duplicating — re-importing over an existing
 *  name is a no-op by default (skip strategy), not a duplicate. The rest is just an example shape —
 *  there's no fixed heading vocabulary; any "#" heading becomes its own section, in order. */
function buildMarkdownTemplate(existingChildNames: string[]): string {
  const lines: string[] = [
    '# What is this topic?',
    '',
    'A short overview — this becomes its own section, titled exactly as written above.',
    '',
    '# Add as many headings as you want',
    '',
    'Every "#" heading becomes its own section, in the order you write them here. Nested',
    '"##"/"###" headings, tables, code blocks, and everything else inside a section stay exactly',
    'as written — nothing gets restructured.',
    '',
  ];
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

export function ImportDialog({
  open,
  defaultParentId = null,
  lockDestination = false,
  targetNode,
  onClose,
}: ImportDialogProps) {
  const { nodes, tree, createNode, addSection, removeSection } = useNodes();
  const tags = useTags();
  const isSelfImport = Boolean(targetNode);

  const [format, setFormat] = useState<ImportFormat>('markdown');
  const [contentMode, setContentMode] = useState<ContentMode>('full');
  const [title, setTitle] = useState('');
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<ImportNode | null>(null);
  const [errors, setErrors] = useState<ImportValidationError[]>([]);
  const [parentId, setParentId] = useState<ID | null>(defaultParentId);
  const [strategy, setStrategy] = useState<ConflictStrategy>('skip');
  const [selfImportStrategy, setSelfImportStrategy] = useState<'merge' | 'replace'>('merge');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const destinations = useMemo(() => flattenTree(tree), [tree]);

  function reset() {
    setTitle('');
    setRaw('');
    setParsed(null);
    setErrors([]);
    setParentId(defaultParentId);
    setSelfImportStrategy('merge');
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
    const scopeParentId = isSelfImport ? targetNode!.id : parentId;
    const existingChildNames = nodes.filter((node) => node.parentId === scopeParentId).map((node) => node.title);
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
      if (!isSelfImport && !title.trim()) {
        setParsed(null);
        setErrors([{ path: 'title', message: 'Title is required for markdown imports' }]);
        return;
      }
      const effectiveTitle = isSelfImport ? targetNode!.title : title;
      setParsed(
        contentMode === 'full'
          ? parseMarkdownImport(effectiveTitle, raw)
          : parseNamesOnlyImport(effectiveTitle, raw),
      );
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

    if (isSelfImport && targetNode) {
      const result = importIntoNode(
        parsed,
        targetNode.id,
        targetNode.sections,
        { createNode, addSection, removeSection, resolveTagIds, findChildByTitle },
        selfImportStrategy,
      );
      setSummary(result);
      return;
    }

    const order = nodes.filter((node) => node.parentId === parentId).length;
    const result = importTree(
      parsed,
      parentId,
      order,
      { createNode, addSection, removeSection, resolveTagIds, findChildByTitle },
      strategy,
    );
    setSummary(result);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSelfImport ? `Add content to "${targetNode!.title}"` : 'Import topics'}
    >
      <div className="import-dialog">
        {isSelfImport && (
          <>
            <p className="import-target-note">
              No new topic is created — sections you paste below are added directly to this topic. Anything under
              a <code>Children</code> heading is still added as a new sub-topic.
            </p>

            <label>
              How should this be added?
              <select
                value={selfImportStrategy}
                onChange={(event) => setSelfImportStrategy(event.target.value as 'merge' | 'replace')}
              >
                <option value="merge">Add as new sections (keep existing content)</option>
                <option value="replace">Replace this topic&apos;s entire content</option>
              </select>
            </label>
          </>
        )}

        {!lockDestination && !isSelfImport && (
          <>
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
                  <label
                    key={option.id}
                    className="import-destination-option"
                    style={{ paddingLeft: option.depth * 16 }}
                  >
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
                <option value="skip">Skip it (keep existing, add nothing)</option>
                <option value="merge">Merge into it (add new sections, keep existing)</option>
                <option value="replace">Replace it (overwrite all sections)</option>
              </select>
            </label>
          </>
        )}

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
            {!isSelfImport && (
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Topic title" />
            )}
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
                  ? 'Paste markdown here — every "# Heading" becomes its own section, in order. Add "# Children" at the end to create sub-topics.'
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
            {summary.replaced > 0 ? `, replaced ${summary.replaced}` : ''}
            {summary.skipped > 0 ? `, skipped ${summary.skipped} that already existed` : ''}.
          </p>
        )}
      </div>
    </Modal>
  );
}
