export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { DemoDataLoader } from './DemoDataLoader';

export const metadata = { title: 'Demo Data — CortexAI' };

export default function DemoDataPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demo Data</h1>
        <p className="text-sm text-gray-500 mt-1">Load a sample SME dataset to explore all CortexAI features</p>
      </div>
      <DemoDataLoader />
    </AppShell>
  );
}
