export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { Database } from 'lucide-react';

export const metadata = { title: 'Demo Data — CortexAI' };

export default function DemoDataPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demo Data</h1>
        <p className="text-sm text-gray-500 mt-1">Load a sample SME dataset to explore CortexAI</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <Database className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Demo data loader coming in Phase 5</p>
      </div>
    </AppShell>
  );
}
