import { EmptyState } from '@shared/components/composite';

export function NodesIndexPage() {
  return (
    <EmptyState
      title="Select a topic"
      description="Choose a node from the tree, or create a new one to get started."
    />
  );
}
