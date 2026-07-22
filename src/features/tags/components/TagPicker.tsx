import { useState, type FormEvent } from 'react';
import { Button, Input } from '@shared/components/ui';
import { useTags } from '../hooks/useTags';
import { randomTagColor } from '../utils/randomTagColor';
import { TagBadge } from './TagBadge';

export interface TagPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/** Lets a feature (Snippets, Notes, ...) attach existing tags or create a new one inline. */
export function TagPicker({ selectedIds, onChange }: TagPickerProps) {
  const { items: tags, create } = useTags();
  const [newTagName, setNewTagName] = useState('');

  function toggle(tagId: string) {
    onChange(
      selectedIds.includes(tagId)
        ? selectedIds.filter((id) => id !== tagId)
        : [...selectedIds, tagId],
    );
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const name = newTagName.trim();
    if (!name) return;

    const tag = create({ name, color: randomTagColor() });
    onChange([...selectedIds, tag.id]);
    setNewTagName('');
  }

  return (
    <div className="tag-picker">
      <div className="tag-picker-options">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={selectedIds.includes(tag.id) ? 'tag-picker-option selected' : 'tag-picker-option'}
          >
            <TagBadge tag={tag} />
          </button>
        ))}
      </div>
      <form className="tag-picker-create" onSubmit={handleCreate}>
        <Input
          value={newTagName}
          onChange={(event) => setNewTagName(event.target.value)}
          placeholder="New tag name"
          aria-label="New tag name"
        />
        <Button type="submit" variant="secondary">
          Add tag
        </Button>
      </form>
    </div>
  );
}
