export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { CustomersContent } from './CustomersContent';

export const metadata = { title: 'Customers — CortexAI' };

export default function CustomersPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">Customer records, pending dues, and order history</p>
      </div>
      <CustomersContent />
    </AppShell>
  );
}
