import { useState, useRef, type DragEvent } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { UploadCloud, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { publicUploadFile } from '../../services/publicUpload.services';

type Status = 'idle' | 'uploading' | 'success' | 'error';

export function PublicUploadPage() {

  const { folderId } = useParams<{ folderId: string }>();
  const [searchParams] = useSearchParams();
  const uploadToken = searchParams.get('token');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!folderId || !uploadToken) {
      setErrorMsg('This upload link is invalid or has expired.');
      setStatus('error');
      return;
    }
    setFileName(file.name);
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      const result = await publicUploadFile(file, folderId, uploadToken, setProgress);
      setUploadedFileUrl(result.file_url || null);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Upload failed. This folder may not accept public uploads.');
      setStatus('error');
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setStatus('idle');
    setFileName('');
    setProgress(0);
    setErrorMsg('');
    setUploadedFileUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-slate-900">Upload a file</h1>
          <p className="text-sm text-slate-500">Drag and drop, or choose a file from your device.</p>
        </div>

        {status === 'idle' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors ${dragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-300 bg-white'
              }`}
          >
            <UploadCloud size={36} className={dragActive ? 'text-brand-primary' : 'text-slate-400'} />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-brand-primary">Click to upload</span> or drag and drop
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {status === 'uploading' && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <FileText size={16} className="text-slate-400" />
              <span className="truncate">{fileName}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-brand-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{progress}% uploaded</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto text-green-600" />
            <p className="text-sm font-medium text-green-800">"{fileName}" uploaded successfully.</p>
            {uploadedFileUrl && (<a

              href={uploadedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium text-brand-primary hover:underline"
            >
              View uploaded file
            </a>
            )}
            <button onClick={reset} className="text-sm font-medium text-brand-primary hover:underline">
              Upload another file
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <XCircle size={32} className="mx-auto text-red-600" />
            <p className="text-sm font-medium text-red-800">{errorMsg}</p>
            <button onClick={reset} className="text-sm font-medium text-brand-primary hover:underline">
              Try again
            </button>
          </div>
        )}
      </div>
    </div >
  );
}