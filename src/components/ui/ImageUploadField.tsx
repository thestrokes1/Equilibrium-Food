import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { uploadImage } from '@/lib/uploadImage';

interface Props {
  value: string;
  onChange: (_url: string) => void;
  folder?: string;
  placeholder?: string;
}

export default function ImageUploadField({ value, onChange, folder = 'menu', placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      setShowUrl(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  // ── With image: show preview + actions ──
  if (value) {
    return (
      <div className="img-field">
        <div className="img-field-filled">
          <img src={value} alt="Preview" className="img-field-thumb-lg" />
          <div className="img-field-actions">
            <button
              type="button"
              className="img-field-action-btn"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <span className="img-field-spinner" />
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Change
                </>
              )}
            </button>
            <button
              type="button"
              className="img-field-action-btn img-field-action-remove"
              onClick={() => onChange('')}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Remove
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="img-field-hidden"
          onChange={handleInputChange}
        />
        {uploadError && <p className="img-field-error">{uploadError}</p>}
      </div>
    );
  }

  // ── No image: drop zone ──
  return (
    <div className="img-field">
      <div
        className={`img-field-dropzone${dragging ? ' img-field-dropzone--drag' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        aria-label="Upload image"
      >
        {uploading ? (
          <>
            <span className="img-field-spinner img-field-spinner--lg" />
            <span className="img-field-drop-text">Uploading…</span>
          </>
        ) : (
          <>
            <svg
              className="img-field-drop-icon"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="img-field-drop-label">
              {dragging ? 'Drop to upload' : 'Upload image'}
            </span>
            <span className="img-field-drop-hint">
              Drag & drop or tap to browse · JPG, PNG, WebP
            </span>
          </>
        )}
      </div>

      {showUrl ? (
        <div className="img-field-url-row">
          <input
            className="admin-input"
            type="text"
            placeholder={placeholder ?? 'https://example.com/image.jpg'}
            onBlur={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
                setShowUrl(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = (e.target as HTMLInputElement).value;
                if (v) {
                  onChange(v);
                  setShowUrl(false);
                }
              }
              if (e.key === 'Escape') setShowUrl(false);
            }}
            autoFocus
          />
          <button type="button" className="img-field-url-cancel" onClick={() => setShowUrl(false)}>
            ✕
          </button>
        </div>
      ) : (
        <button type="button" className="img-field-url-toggle" onClick={() => setShowUrl(true)}>
          Or paste image URL
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="img-field-hidden"
        onChange={handleInputChange}
      />
      {uploadError && <p className="img-field-error">{uploadError}</p>}
    </div>
  );
}
