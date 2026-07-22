import { useState } from 'react';
import { Button } from '@shared/components/ui';
import type { ID } from '@shared/types/common';
import { ImportDialog } from './ImportDialog';

export interface ImportButtonProps {
  /** Preselected destination when the dialog opens; the user can change it in the dialog. */
  defaultParentId?: ID | null;
  label?: string;
}

export function ImportButton({ defaultParentId = null, label = 'Import' }: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setIsOpen(true)}>
        {label}
      </Button>
      <ImportDialog open={isOpen} defaultParentId={defaultParentId} onClose={() => setIsOpen(false)} />
    </>
  );
}
