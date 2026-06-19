export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { Upload } from 'lucide-react';

export const metadata = { title: 'Upload Files — CortexAI' };

export default function UploadPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload CSV, Excel, PDF, TXT, or invoice images to extract business data
        </p>
      </div>
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mx-auto mb-4">
          <Upload className="h-7 w-7 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">Upload coming in Phase 1</p>
        <p className="text-xs text-gray-400">CSV, Excel, PDF, TXT, JPG, PNG — up to 10 MB each</p>
      </div>
    </AppShell>
  );
}
