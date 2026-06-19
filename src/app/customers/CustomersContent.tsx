'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Customer } from '@/types/database';

const STATUS_TABS = ['all', 'active', 'pending', 'inactive'] as const;
type StatusTab = typeof STATUS_TABS[number];

function StatusBadge({ status }: { status: Customer['status'] }) {
  const map: Record<Customer['status'], { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
    active: { label: 'Active', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    inactive: { label: 'Inactive', variant: 'secondary' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const supabase = createClient();

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('amount_owed', { ascending: false });

      if (error) {
        setError('Failed to load customers. Please refresh.');
      } else {
        setCustomers((data || []) as Customer[]);
      }
      setLoading(false);
    }
    fetchCustomers();
  }, [supabase]);

  const filtered = activeTab === 'all'
    ? customers
    : customers.filter((c) => c.status === activeTab);

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
                {tab === 'all'
                  ? customers.length
                  : customers.filter((c) => c.status === tab).length}
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
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Amount Owed</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No customers found.</p>
                  <Link href="/upload" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                    Upload a file to add customers
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-gray-500">{customer.phone || '—'}</TableCell>
                  <TableCell className={customer.amount_owed > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                    {customer.amount_owed > 0 ? formatCurrency(customer.amount_owed) : '—'}
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDate(customer.last_order)}</TableCell>
                  <TableCell><StatusBadge status={customer.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
