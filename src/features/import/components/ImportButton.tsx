import { useState } from 'react';
import { Button } from '@shared/components/ui';
import type { ID } from '@shared/types/common';
import { ImportDialog } from './ImportDialog';

export interface ImportButtonProps {
  /** Preselected destination when the dialog opens; the user can change it in the dialog. */
  defaultParentId?: ID | null;
  /** When true, the destination picker and conflict-strategy option are hidden — imports always target defaultParentId. */
  lockDestination?: boolean;
  label?: string;
}

export function ImportButton({ defaultParentId = null, lockDestination = false, label = 'Import' }: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setIsOpen(true)}>
        {label}
      </Button>
      <ImportDialog
        open={isOpen}
        defaultParentId={defaultParentId}
        lockDestination={lockDestination}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
