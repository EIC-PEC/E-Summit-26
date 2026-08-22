'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Link as LinkIcon, X, Loader2, Check } from 'lucide-react';
import { api } from '../../lib/api';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  placeholder?: string;
}

// Helper to optimize large images before upload
async function optimizeImage(file: File, maxDim = 1920, quality = 0.88): Promise<{ file: File; dataUri: string }> {
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = (e.target?.result as string) || '';
        resolve({ file, dataUri });
      };
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, dataUri: e.target?.result as string });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUri = canvas.toDataURL(mime, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, { type: mime });
              resolve({ file: optimizedFile, dataUri });
            } else {
              resolve({ file, dataUri });
            }
          },
          mime,
          quality,
        );
      };
      img.onerror = () => resolve({ file, dataUri: e.target?.result as string });
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label = 'Image Asset',
  folder = 'media',
  aspectRatio = 'video',
  placeholder = 'Drag & drop image here or click to browse',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (.png, .jpg, .webp, .svg)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size must be under 25MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Optimize image before sending
      const { file: optimizedFile, dataUri } = await optimizeImage(file);

      try {
        const res = await api.uploadFile(optimizedFile, folder);
        if (res?.url) {
          onChange(res.url);
        } else {
          onChange(dataUri);
        }
      } catch {
        // Direct local DataURI fallback
        onChange(dataUri);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectCls =
    aspectRatio === 'square'
      ? 'aspect-square max-h-48'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9] max-h-48'
      : aspectRatio === 'video'
      ? 'aspect-video max-h-48'
      : 'min-h-36';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
          >
            {mode === 'upload' ? (
              <>
                <LinkIcon className="h-3 w-3" />
                <span>Or Enter URL</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-3 w-3" />
                <span>Or Drag & Drop File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <input
            type="text"
            className="w-full rounded-none border border-white/10 bg-[#141C24] p-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            placeholder="https://example.com/photo.jpg or /gallery/photo.png"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && (
            <div className={`relative rounded-[4px] border border-(--border-subtle) overflow-hidden bg-(--bg-panel-alt) ${aspectCls} flex items-center justify-center`}>
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={() => {}}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 rounded-[4px] bg-(--bg-panel)/90 backdrop-blur-md p-1.5 text-(--text-muted) hover:text-rose-600 dark:hover:text-rose-400 hover:bg-(--bg-panel-alt) border border-(--border-panel) shadow-sm transition-all"
                title="Remove Image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
            className="hidden"
            onChange={onFileChange}
          />

          {value ? (
            <div className={`group relative rounded-[4px] border border-(--border-panel) overflow-hidden bg-(--bg-panel-alt) ${aspectCls} flex items-center justify-center`}>
              <img
                src={value}
                alt="Uploaded Asset"
                className="h-full w-full object-contain"
                onError={() => {}}
              />
              <div className="absolute inset-0 bg-(--bg-panel)/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[4px] bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-[4px] bg-rose-500 hover:bg-rose-400 px-3 py-1.5 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 rounded-[4px] bg-(--bg-panel)/90 backdrop-blur-md px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 border border-(--border-panel) shadow-sm">
                <Check className="h-3 w-3" />
                <span className="truncate max-w-50">{value.startsWith('data:') ? 'Local file uploaded' : value}</span>
              </div>
            </div>

          ) : (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-none border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/15 bg-[#0E141B] hover:border-emerald-500/40 hover:bg-white/2'
              } ${aspectCls} flex flex-col items-center justify-center space-y-2`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center space-y-2 text-emerald-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-xs font-medium">Processing & uploading image...</span>
                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-white/5 text-zinc-400 group-hover:text-emerald-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-200">
                      {isDragging ? 'Drop file here' : placeholder}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      PNG, JPG, WEBP, or SVG up to 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 font-medium">{error}</p>
      )}
    </div>
  );
};
