import { Input, Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { SectionEditProps } from './types';

export function ReferencesEdit({ content, onChange }: SectionEditProps<'references'>) {
  return (
    <RepeatableFieldList
      items={content.items}
      onChange={(items) => onChange({ items })}
      createItem={() => ({ id: generateId(), title: '', source: '', description: '', url: '' })}
      addLabel="+ Add reference"
      emptyLabel="No references yet."
      renderItem={(item, update) => (
        <>
          <Input value={item.title} onChange={(event) => update({ title: event.target.value })} placeholder="Title" />
          <Input
            value={item.source}
            onChange={(event) => update({ source: event.target.value })}
            placeholder="Source (e.g. MDN, Microsoft Learn)"
          />
          <Textarea
            value={item.description}
            onChange={(event) => update({ description: event.target.value })}
            rows={2}
            placeholder="Description (optional)"
          />
          <Input value={item.url} onChange={(event) => update({ url: event.target.value })} placeholder="URL" type="url" />
        </>
      )}
    />
  );
}
