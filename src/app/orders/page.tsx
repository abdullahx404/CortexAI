export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { OrdersContent } from './OrdersContent';

export const metadata = { title: 'Orders — CortexAI' };

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Pending, completed, and overdue orders</p>
      </div>
      <OrdersContent />
    </AppShell>
  );
}
