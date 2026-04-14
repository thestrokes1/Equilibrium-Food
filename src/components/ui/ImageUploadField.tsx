import { useRef, useState, type ChangeEvent } from 'react';
import { uploadImage } from '@/lib/uploadImage';

interface Props {
  value: string;
  onChange: (_url: string) => void;
  folder?: string;
  placeholder?: string;
}

/**
 * Admin form field that accepts an image URL (typed or pasted) OR a file
 * uploaded directly to Supabase Storage. Shows a thumbnail preview when a
 * URL is present.
 */
export default function ImageUploadField({ value, onChange, folder = 'menu', placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="img-field">
      {value && (
        <div className="img-field-preview">
          <img src={value} alt="Preview" className="img-field-thumb" />
          <button
            type="button"
            className="img-field-clear"
            onClick={() => onChange('')}
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}

      <div className="img-field-row">
        <input
          className="admin-input img-field-url"
          type="text"
          value={value}
          placeholder={placeholder ?? 'https://...'}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="img-field-upload-btn"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          title="Upload image file"
        >
          {uploading ? '…' : '↑'}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="img-field-hidden"
        onChange={handleFile}
      />

      {uploadError && <p className="img-field-error">{uploadError}</p>}
    </div>
  );
}
