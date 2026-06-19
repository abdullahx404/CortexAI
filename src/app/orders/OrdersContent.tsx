'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, AlertCircle, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, getDaysOverdue, cn } from '@/lib/utils';
import type { Order } from '@/types/database';

const STATUS_TABS = ['all', 'pending', 'overdue', 'completed'] as const;
type StatusTab = typeof STATUS_TABS[number];

function StatusBadge({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], { label: string; variant: 'warning' | 'destructive' | 'success' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    overdue: { label: 'Overdue', variant: 'destructive' },
    completed: { label: 'Completed', variant: 'success' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function DueDateCell({ dueDate, status }: { dueDate: string | null; status: Order['status'] }) {
  if (!dueDate) return <span className="text-gray-400">—</span>;

  const daysOverdue = getDaysOverdue(dueDate);
  const isLate = daysOverdue > 0 && status !== 'completed';

  return (
    <div className="flex items-center gap-1.5">
      {isLate && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
      <span className={isLate ? 'text-red-600 font-medium' : 'text-gray-500'}>
        {formatDate(dueDate)}
        {isLate && ` (${daysOverdue}d overdue)`}
      </span>
    </div>
  );
}

export function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        setError('Failed to load orders. Please refresh.');
      } else {
        setOrders((data || []) as Order[]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [supabase]);

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {!loading && (
              <span className="ml-1.5 text-xs text-gray-400">
                {tab === 'all' ? orders.length : orders.filter((o) => o.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No orders found.</p>
                  <Link href="/upload" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                    Upload a file to add orders
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const isOverdue = order.status === 'overdue' ||
                  (order.due_date && getDaysOverdue(order.due_date) > 0 && order.status !== 'completed');
                return (
                  <TableRow key={order.id} className={cn(isOverdue ? 'bg-red-50' : '')}>
                    <TableCell className="font-mono text-sm text-gray-600">
                      {order.order_id || '—'}
                    </TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.item}</TableCell>
                    <TableCell className="text-gray-500">{order.quantity}</TableCell>
                    <TableCell>
                      <DueDateCell dueDate={order.due_date} status={order.status} />
                    </TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
