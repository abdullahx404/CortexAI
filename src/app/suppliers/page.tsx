export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { SuppliersContent } from './SuppliersContent';

export const metadata = { title: 'Suppliers — CortexAI' };

export default function SuppliersPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <p className="text-sm text-gray-500 mt-1">Compare supplier prices and lead times per item</p>
      </div>
      <SuppliersContent />
    </AppShell>
  );
}
