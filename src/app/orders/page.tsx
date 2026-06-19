export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Orders — CortexAI' };

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Pending, completed, and overdue orders</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-3">No orders yet.</p>
        <Link href="/upload" className="text-sm text-blue-600 hover:underline">
          Upload a file to get started
        </Link>
      </div>
    </AppShell>
  );
}
