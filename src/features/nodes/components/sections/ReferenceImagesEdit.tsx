import { ImageUploader } from '@shared/components/ui';
import type { SectionEditProps } from './types';

export function ReferenceImagesEdit({ content, onChange }: SectionEditProps<'referenceImages'>) {
  return <ImageUploader images={content.images} onChange={(images) => onChange({ images })} />;
}
