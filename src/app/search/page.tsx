export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { Search } from 'lucide-react';

export const metadata = { title: 'Search — CortexAI' };

export default function SearchPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-sm text-gray-500 mt-1">Search across all your business records</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Search coming in Phase 4</p>
      </div>
    </AppShell>
  );
}
