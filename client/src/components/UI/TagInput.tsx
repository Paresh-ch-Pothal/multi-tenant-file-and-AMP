import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ label, tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  function addTag() {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex flex-wrap items-center gap-1.5 rounded border border-slate-300 px-2 py-1.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {tag}
            <button onClick={() => removeTag(tag)} type="button">
              <X size={12} className="text-slate-400 hover:text-slate-600" />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? 'Add tags…' : ''}
          className="flex-1 min-w-[80px] border-none py-0.5 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <p className="text-xs text-slate-400">Press Enter or comma to add a tag</p>
    </div>
  );
}