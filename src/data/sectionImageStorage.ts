import { supabase } from './supabaseClient';

const BUCKET = 'section-images';
const MAX_BYTES = 8 * 1024 * 1024;

export interface UploadedSectionImage {
  /** Storage object path — kept alongside the public URL so the object can be removed later. */
  path: string;
  url: string;
}

/**
 * Uploads a single image to the `section-images` Storage bucket and returns its permanent public
 * URL. Public (not signed) so the URL keeps working indefinitely wherever it's stored — including
 * in a PDF export opened long after upload, where a signed URL would have since expired.
 */
export async function uploadSectionImage(file: File): Promise<UploadedSectionImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Images must be 8MB or smaller.');
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** Best-effort cleanup — logged, not thrown, so a failed delete (e.g. already-removed object)
 *  never blocks the section/content edit that triggered it. */
export async function deleteSectionImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Failed to delete section image:', error.message);
}
