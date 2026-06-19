'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudUpload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ALLOWED_EXTENSIONS = ['csv', 'xlsx', 'xls', 'txt', 'pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 5;

type FileStatus = 'pending' | 'uploading' | 'extracting' | 'structuring' | 'done' | 'error';

interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
  document_id?: string;
  extracted_chars?: number;
  records_inserted?: { customers: number; orders: number; suppliers: number; follow_ups: number };
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <ImageIcon className="h-4 w-4 text-purple-500" />;
  if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  return <FileText className="h-4 w-4 text-blue-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status, error }: { status: FileStatus; error?: string }) {
  const map: Record<FileStatus, { label: string; icon: React.ReactNode; className: string }> = {
    pending: { label: 'Ready', icon: null, className: 'bg-gray-100 text-gray-600' },
    uploading: { label: 'Uploading...', icon: <Loader2 className="h-3 w-3 animate-spin" />, className: 'bg-blue-100 text-blue-600' },
    extracting: { label: 'Extracting text...', icon: <Loader2 className="h-3 w-3 animate-spin" />, className: 'bg-blue-100 text-blue-600' },
    structuring: { label: 'AI structuring...', icon: <Loader2 className="h-3 w-3 animate-spin" />, className: 'bg-purple-100 text-purple-600' },
    done: { label: 'Done', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-green-100 text-green-600' },
    error: { label: error || 'Error', icon: <AlertCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-600' },
  };
  const { label, icon, className } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {icon}
      {status === 'error' && error ? error : label}
    </span>
  );
}

export function UploadCenter() {
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `${file.name}: File type not supported.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `${file.name}: File too large (max ${MAX_FILE_SIZE_MB} MB).`;
    }
    return null;
  };

  const addFiles = useCallback((incoming: File[]) => {
    const available = MAX_FILES - fileEntries.length;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_FILES} files allowed at once.`);
      return;
    }

    const toAdd = incoming.slice(0, available);
    if (incoming.length > available) {
      toast.warning(`Only ${available} more file(s) can be added. Extras were skipped.`);
    }

    const newEntries: FileEntry[] = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      error: validateFile(file) || undefined,
    }));

    // Mark invalid ones as error immediately
    newEntries.forEach((entry) => {
      if (entry.error) entry.status = 'error';
    });

    setFileEntries((prev) => [...prev, ...newEntries]);
  }, [fileEntries.length]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFileEntries((prev) => prev.filter((f) => f.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<FileEntry>) => {
    setFileEntries((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleUpload = async () => {
    const validEntries = fileEntries.filter((e) => e.status === 'pending');
    if (validEntries.length === 0) return;

    setIsUploading(true);

    for (const entry of validEntries) {
      updateEntry(entry.id, { status: 'uploading' });

      const formData = new FormData();
      formData.append('files', entry.file);

      try {
        updateEntry(entry.id, { status: 'extracting' });

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success) {
          updateEntry(entry.id, {
            status: 'error',
            error: uploadData.error || 'Upload failed.',
          });
          continue;
        }

        const fileResult = uploadData.files?.[0];

        if (!fileResult?.success) {
          updateEntry(entry.id, {
            status: 'error',
            error: fileResult?.error || 'Upload failed.',
          });
          continue;
        }

        if (!fileResult.extraction_success) {
          updateEntry(entry.id, {
            status: 'error',
            error: fileResult.extraction_error || 'Text extraction failed.',
            document_id: fileResult.document_id,
          });
          continue;
        }

        // Now trigger structuring
        updateEntry(entry.id, { status: 'structuring', document_id: fileResult.document_id, extracted_chars: fileResult.extracted_chars });

        const structureRes = await fetch('/api/structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id: fileResult.document_id }),
        });

        const structureData = await structureRes.json();

        if (structureData.success) {
          updateEntry(entry.id, {
            status: 'done',
            records_inserted: structureData.inserted,
          });
          toast.success(`${entry.file.name} processed successfully!`);
        } else {
          updateEntry(entry.id, {
            status: 'error',
            error: structureData.error || 'AI structuring failed. Raw text was saved.',
          });
          toast.warning(`${entry.file.name}: Text saved but AI structuring failed.`);
        }
      } catch {
        updateEntry(entry.id, {
          status: 'error',
          error: 'Network error. Please try again.',
        });
      }
    }

    setIsUploading(false);
  };

  const pendingCount = fileEntries.filter((e) => e.status === 'pending').length;
  const doneCount = fileEntries.filter((e) => e.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors',
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.txt,.pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
          aria-label="Upload files"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <CloudUpload className={cn('h-7 w-7', isDragging ? 'text-blue-600' : 'text-gray-400')} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              CSV, Excel, PDF, TXT, JPG, PNG — up to {MAX_FILE_SIZE_MB} MB each, max {MAX_FILES} files
            </p>
          </div>
        </div>
      </div>

      {/* Supported formats info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <FileSpreadsheet className="h-4 w-4 text-green-600" />, label: 'CSV & Excel', desc: 'Structured data rows' },
          { icon: <FileText className="h-4 w-4 text-blue-600" />, label: 'PDF & TXT', desc: 'Text-based documents' },
          { icon: <ImageIcon className="h-4 w-4 text-purple-600" />, label: 'JPG & PNG', desc: 'Invoice images (OCR)' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 flex items-start gap-2">
            <div className="mt-0.5">{icon}</div>
            <div>
              <p className="text-xs font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* File Queue */}
      {fileEntries.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">
              Files ({fileEntries.length})
            </h2>
            {doneCount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                {doneCount} processed
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {fileEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                <div className="shrink-0">{getFileIcon(entry.file.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{formatFileSize(entry.file.size)}</span>
                    {entry.status === 'done' && entry.records_inserted && (
                      <span className="text-xs text-gray-400">
                        · {Object.values(entry.records_inserted).reduce((a, b) => a + b, 0)} records
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={entry.status} error={entry.status === 'error' ? entry.error : undefined} />
                  {(entry.status === 'pending' || entry.status === 'error') && !isUploading && (
                    <button
                      onClick={() => removeFile(entry.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`Remove ${entry.file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {fileEntries.length > 0 && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleUpload}
            disabled={pendingCount === 0 || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {pendingCount > 0 ? `${pendingCount} File${pendingCount > 1 ? 's' : ''}` : ''}
              </>
            )}
          </Button>
          {!isUploading && (
            <Button
              variant="ghost"
              onClick={() => setFileEntries([])}
              className="text-gray-500"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
