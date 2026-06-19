export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { SearchContent } from './SearchContent';

export const metadata = { title: 'Search — CortexAI' };

export default function SearchPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-sm text-gray-500 mt-1">Search across all your business records</p>
      </div>
      <SearchContent />
    </AppShell>
  );
}
