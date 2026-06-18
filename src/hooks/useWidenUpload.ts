import { useState } from 'react';
import { uploadImageToWiden, ApiError, type WidenUploadResult } from '../api';
import { uploadStore } from '../utils/uploadStore';

export type UploadStage = '' | 'uploading' | 'fetching' | 'saving';

export const UPLOAD_STAGE_LABEL: Record<Exclude<UploadStage, ''>, string> = {
  uploading: 'Uploading…',
  fetching:  'Fetching asset details…',
  saving:    'Saving asset…',
};

/**
 * Single source of truth for the Widen upload flow:
 *   select file → upload → fetch asset details → extract image URL →
 *   save to the local asset library (keeps the Upload Panel in sync).
 *
 * Shared by every upload entry point (Image Properties panel, Upload Panel)
 * so there is exactly one implementation. Callers receive the result and may
 * do extra work (e.g. update the selected element) — saving to the library
 * always happens here regardless.
 */
export function useWidenUpload() {
  const [status, setStatus] = useState<UploadStage>('');
  const [error, setError]   = useState('');

  const isUploading = status !== '';

  const upload = async (file: File): Promise<WidenUploadResult | null> => {
    setError('');
    try {
      const result = await uploadImageToWiden(file, stage =>
        setStatus(stage === 'uploading' ? 'uploading' : 'fetching'),
      );

      // Persist to the local asset library so it's reusable from the Upload Panel.
      setStatus('saving');
      uploadStore.addFiles([{
        id: result.assetId,
        name: file.name,
        url: result.imageUrl,
        kind: 'image',
        assetUrl: result.assetUrl,
        fileName: file.name,
      }]);

      return result;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Image upload failed. Please try again.';
      setError(msg);
      return null;
    } finally {
      setStatus('');
    }
  };

  return { upload, status, error, isUploading, setError };
}
