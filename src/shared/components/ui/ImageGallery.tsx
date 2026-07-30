import { useState, type MouseEvent } from 'react';

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
}

/** Read-only grid of reference images with click-to-zoom, shared by every section type's view
 *  (the cross-cutting per-section gallery) and the dedicated 'referenceImages' section. */
export function ImageGallery({ images }: ImageGalleryProps) {
  const [zoomedSrc, setZoomedSrc] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="image-gallery">
      {images.map((image) => (
        <figure key={image.id} className="image-gallery-item">
          <img
            src={image.url}
            alt={image.caption}
            className="markdown-image"
            onClick={() => setZoomedSrc(image.url)}
          />
          {image.caption.trim() && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}

      {zoomedSrc && (
        <div className="image-lightbox" onClick={() => setZoomedSrc(null)}>
          <img src={zoomedSrc} alt="" onClick={(event: MouseEvent) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
