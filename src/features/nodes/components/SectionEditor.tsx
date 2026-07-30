import { useEffect, useState, type FormEvent } from 'react';
import { Button, ImageUploader } from '@shared/components/ui';
import { TagPicker } from '@features/tags';
import { SECTION_LABELS } from '../config/sectionRegistry';
import { renderSectionEdit } from './sections/registry';
import type { Section, SectionInput } from '../types/Section';

export interface SectionEditorProps {
  section: Section;
  onSave: (patch: Partial<SectionInput>) => void;
  onDelete: () => void;
  /** Reports whether this section has edits since the last "Save section" click, so an ancestor
   *  (NodeEditor -> NodeDetailPage) can warn before discarding them. Fires on every dirty/clean
   *  transition, including a final `false` on unmount (e.g. "Remove section"). */
  onDirtyChange?: (isDirty: boolean) => void;
}

export function SectionEditor({ section, onSave, onDelete, onDirtyChange }: SectionEditorProps) {
  const [content, setContent] = useState<Section['content']>(section.content);
  const [tagIds, setTagIds] = useState(section.tagIds);
  const [markedImportant, setMarkedImportant] = useState(Boolean(section.markedImportant));
  const [images, setImages] = useState(section.images ?? []);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Reports "clean" on unmount (section removed, or the editor closes) so the parent's aggregate
  // dirty count doesn't keep counting a section that's no longer being edited.
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  function handleContentChange(next: Section['content']) {
    setContent(next);
    setIsDirty(true);
  }

  function handleTagIdsChange(next: string[]) {
    setTagIds(next);
    setIsDirty(true);
  }

  function handleMarkedImportantChange(next: boolean) {
    setMarkedImportant(next);
    setIsDirty(true);
  }

  function handleImagesChange(next: typeof images) {
    setImages(next);
    setIsDirty(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ content, tagIds, markedImportant, images } as Partial<SectionInput>);
    setIsDirty(false);
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

      {renderSectionEdit({ ...section, content } as Section, handleContentChange)}

      <label className="section-editor-important">
        <input
          type="checkbox"
          checked={markedImportant}
          onChange={(event) => handleMarkedImportantChange(event.target.checked)}
        />
        Mark important (shows in Revision mode)
      </label>

      <TagPicker selectedIds={tagIds} onChange={handleTagIdsChange} />

      {/* Skipped for 'referenceImages' sections — their own content editor above already is an
          image gallery, so a second one here would just duplicate it. */}
      {section.type !== 'referenceImages' && (
        <div className="section-editor-images">
          <span className="section-editor-images-label">Reference images</span>
          <ImageUploader images={images} onChange={handleImagesChange} />
        </div>
      )}

      <Button type="submit" variant="secondary">
        Save section
      </Button>
    </form>
  );
}
