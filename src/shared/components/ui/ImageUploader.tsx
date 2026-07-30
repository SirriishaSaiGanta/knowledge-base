import { useState, type ChangeEvent } from 'react';
import { uploadSectionImage, deleteSectionImage } from '@data/sectionImageStorage';
import { generateId } from '@shared/utils/id';
import { Button } from './Button';
import { Input } from './Input';

export interface ManagedImage {
  id: string;
  url: string;
  path: string;
  caption: string;
}

export interface ImageUploaderProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}

/** Upload/manage widget backing both the cross-cutting per-section gallery (SectionEditor) and the
 *  dedicated 'referenceImages' section editor. Deletes the underlying Storage object immediately
 *  when an image is removed, rather than leaving it orphaned until some later cleanup pass. */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadSectionImage(file);
      onChange([...images, { id: generateId(), url: uploaded.url, path: uploaded.path, caption: '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }

  function updateCaption(id: string, caption: string) {
    onChange(images.map((image) => (image.id === id ? { ...image, caption } : image)));
  }

  function removeImage(id: string) {
    const image = images.find((item) => item.id === id);
    onChange(images.filter((item) => item.id !== id));
    if (image) void deleteSectionImage(image.path);
  }

  return (
    <div className="image-uploader">
      {images.length > 0 && (
        <div className="image-uploader-grid">
          {images.map((image) => (
            <div key={image.id} className="image-uploader-item">
              <img src={image.url} alt={image.caption} />
              <Input
                value={image.caption}
                onChange={(event) => updateCaption(image.id, event.target.value)}
                placeholder="Caption (optional)"
              />
              <Button type="button" variant="ghost" onClick={() => removeImage(image.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <label className={isUploading ? 'btn btn-secondary image-uploader-add disabled' : 'btn btn-secondary image-uploader-add'}>
        {isUploading ? 'Uploading…' : '+ Add image'}
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} hidden />
      </label>

      {error && <p className="section-error-hint">{error}</p>}
    </div>
  );
}
