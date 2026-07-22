import { Input, Textarea, RepeatableFieldList } from '@shared/components/ui';
import { generateId } from '@shared/utils/id';
import type { SectionEditProps } from './types';

export function RealWorldExampleEdit({ content, onChange }: SectionEditProps<'realWorldExample'>) {
  return (
    <RepeatableFieldList
      items={content.examples}
      onChange={(examples) => onChange({ examples })}
      createItem={() => ({ id: generateId(), icon: '💡', title: '', description: '' })}
      addLabel="+ Add example"
      emptyLabel="No examples yet."
      renderItem={(example, update) => (
        <>
          <Input
            value={example.icon}
            onChange={(event) => update({ icon: event.target.value })}
            placeholder="Icon (emoji)"
            className="example-icon-input"
          />
          <Input
            value={example.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Title (e.g. Banking)"
          />
          <Textarea
            value={example.description}
            onChange={(event) => update({ description: event.target.value })}
            rows={3}
            placeholder="Description"
          />
        </>
      )}
    />
  );
}
