import { useRef, useState, useEffect } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface FilePickerProps {
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}

export function FilePicker({ label, file, onChange, accept = 'image/*' }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

      {previewUrl ? (
        <div className="relative inline-block">
          <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-slate-400 shadow hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded border border-dashed border-slate-300 text-slate-400 hover:border-brand-primary hover:text-brand-primary"
        >
          <ImagePlus size={20} />
          <span className="text-[10px]">Add image</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}