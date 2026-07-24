import { useState } from 'react';
import { Button } from '@shared/components/ui';
import type { ID } from '@shared/types/common';
import type { KnowledgeNode } from '@features/nodes';
import { ImportDialog } from './ImportDialog';

export interface ImportButtonProps {
  /** Preselected destination when the dialog opens; the user can change it in the dialog. */
  defaultParentId?: ID | null;
  /** When true, the destination picker and conflict-strategy option are hidden — imports always target defaultParentId. */
  lockDestination?: boolean;
  /** When set, pasted content is added/replaced directly on this existing node instead of creating a new
   *  one — pass the currently-viewed node to make this button add content to that topic itself. */
  targetNode?: KnowledgeNode;
  label?: string;
}

export function ImportButton({
  defaultParentId = null,
  lockDestination = false,
  targetNode,
  label = 'Import',
}: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" aria-label={label} onClick={() => setIsOpen(true)}>
        <span aria-hidden="true">📥</span> <span className="import-button-label">{label}</span>
      </Button>
      <ImportDialog
        open={isOpen}
        defaultParentId={defaultParentId}
        lockDestination={lockDestination}
        targetNode={targetNode}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
