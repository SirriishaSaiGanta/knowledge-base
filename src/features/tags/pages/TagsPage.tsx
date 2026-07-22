import { PageHeader, EmptyState } from '@shared/components/composite';
import { Button, Card } from '@shared/components/ui';
import { useTags } from '../hooks/useTags';
import { TagBadge } from '../components/TagBadge';

export function TagsPage() {
  const { items: tags, remove } = useTags();

  return (
    <section>
      <PageHeader title="Tags" description="Manage the tags used across topic sections." />

      {tags.length === 0 ? (
        <EmptyState
          title="No tags yet"
          description="Tags are created from a section's editor — add one there to see it here."
        />
      ) : (
        <div className="tag-list">
          {tags.map((tag) => (
            <Card key={tag.id} className="tag-list-item">
              <TagBadge tag={tag} />
              <Button variant="ghost" onClick={() => remove(tag.id)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
