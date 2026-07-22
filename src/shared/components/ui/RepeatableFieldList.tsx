import type { ReactNode } from 'react';
import { Button } from './Button';

export interface RepeatableFieldListProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel?: string;
  emptyLabel?: string;
}

/**
 * Generic add/edit/remove-row editor for array-of-object section content
 * (examples, practices, mistakes, questions, references, ...). Each section
 * editor only has to describe its own row's fields via `renderItem`.
 */
export function RepeatableFieldList<T extends { id: string }>({
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = '+ Add',
  emptyLabel,
}: RepeatableFieldListProps<T>) {
  function updateItem(id: string, patch: Partial<T>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="repeatable-field-list">
      {items.length === 0 && emptyLabel && <p className="repeatable-field-list-empty">{emptyLabel}</p>}
      {items.map((item) => (
        <div key={item.id} className="repeatable-field-list-row">
          <div className="repeatable-field-list-fields">{renderItem(item, (patch) => updateItem(item.id, patch))}</div>
          <Button type="button" variant="ghost" onClick={() => removeItem(item.id)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => onChange([...items, createItem()])}>
        {addLabel}
      </Button>
    </div>
  );
}
