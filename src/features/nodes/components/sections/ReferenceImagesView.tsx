import { ImageGallery } from '@shared/components/ui';
import type { SectionViewProps } from './types';

export function ReferenceImagesView({ content }: SectionViewProps<'referenceImages'>) {
  if (content.images.length === 0) return <p>No images yet.</p>;
  return <ImageGallery images={content.images} />;
}
