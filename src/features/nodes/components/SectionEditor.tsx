import { useState, type FormEvent } from 'react';
import { Button } from '@shared/components/ui';
import { TagPicker } from '@features/tags';
import { SECTION_LABELS } from '../config/sectionRegistry';
import { renderSectionEdit } from './sections/registry';
import type { Section, SectionInput } from '../types/Section';

export interface SectionEditorProps {
  section: Section;
  onSave: (patch: Partial<SectionInput>) => void;
  onDelete: () => void;
}

export function SectionEditor({ section, onSave, onDelete }: SectionEditorProps) {
  const [content, setContent] = useState<Section['content']>(section.content);
  const [tagIds, setTagIds] = useState(section.tagIds);
  const [markedImportant, setMarkedImportant] = useState(Boolean(section.markedImportant));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ content, tagIds, markedImportant } as Partial<SectionInput>);
  }

  // Reflects what's currently being typed for a 'markdown' section, not just the last-saved title.
  const label =
    section.type === 'markdown'
      ? (content as { title: string }).title.trim() || 'Untitled section'
      : SECTION_LABELS[section.type];

  return (
    <form className="entity-form section-editor" onSubmit={handleSubmit}>
      <div className="section-editor-header">
        <h3>{label}</h3>
        <Button type="button" variant="ghost" onClick={onDelete}>
          Remove section
        </Button>
      </div>

      {renderSectionEdit({ ...section, content } as Section, setContent)}

      <label className="section-editor-important">
        <input
          type="checkbox"
          checked={markedImportant}
          onChange={(event) => setMarkedImportant(event.target.checked)}
        />
        Mark important (shows in Revision mode)
      </label>

      <TagPicker selectedIds={tagIds} onChange={setTagIds} />

      <Button type="submit" variant="secondary">
        Save section
      </Button>
    </form>
  );
}
