export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { UploadCenter } from './UploadCenter';

export const metadata = { title: 'Upload Files — CortexAI' };

export default function UploadPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload CSV, Excel, PDF, TXT, or invoice images — CortexAI will extract and structure the data automatically
        </p>
      </div>
      <UploadCenter />
    </AppShell>
  );
}
