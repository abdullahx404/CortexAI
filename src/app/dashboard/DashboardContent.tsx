'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Bell,
  Upload,
  Database,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Document } from '@/types/database';

interface SummaryData {
  totalPendingPayments: number;
  overdueOrdersCount: number;
  activeCustomersCount: number;
  todaysFollowupsCount: number;
  recentDocuments: Document[];
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  color = 'blue',
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  href: string;
  color?: 'blue' | 'red' | 'green' | 'amber';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <Link href={href}>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <TrendingUp className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>
      </div>
    </Link>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function DashboardContent() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const today = new Date().toISOString().split('T')[0];

        const [
          { data: customers, error: custErr },
          { data: overdueOrders, error: orderErr },
          { data: activeCustomers, error: activeErr },
          { data: todaysFollowups, error: followErr },
          { data: recentDocs, error: docErr },
        ] = await Promise.all([
          supabase.from('customers').select('amount_owed').gt('amount_owed', 0),
          supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'overdue'),
          supabase.from('customers').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('follow_ups').select('id', { count: 'exact' }).eq('status', 'pending').eq('due_date', today),
          supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        if (custErr || orderErr || activeErr || followErr || docErr) {
          throw new Error('Failed to load dashboard data');
        }

        const totalPendingPayments = (customers || []).reduce(
          (sum, c) => sum + (c.amount_owed || 0),
          0
        );

        setData({
          totalPendingPayments,
          overdueOrdersCount: overdueOrders?.length || 0,
          activeCustomersCount: activeCustomers?.length || 0,
          todaysFollowupsCount: todaysFollowups?.length || 0,
          recentDocuments: (recentDocs || []) as Document[],
        });
      } catch {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your business overview at a glance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/upload">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </Link>
          <Link href="/demo-data">
            <Button variant="secondary" size="sm" className="gap-2">
              <Database className="h-4 w-4" />
              Load Demo Data
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              icon={DollarSign}
              title="Pending Payments"
              value={formatCurrency(data?.totalPendingPayments || 0)}
              subtitle="Total amount owed by customers"
              href="/customers"
              color="red"
            />
            <SummaryCard
              icon={ShoppingCart}
              title="Overdue Orders"
              value={data?.overdueOrdersCount || 0}
              subtitle="Orders past their due date"
              href="/orders"
              color="amber"
            />
            <SummaryCard
              icon={Users}
              title="Active Customers"
              value={data?.activeCustomersCount || 0}
              subtitle="Currently active customer accounts"
              href="/customers"
              color="blue"
            />
            <SummaryCard
              icon={Bell}
              title="Today's Follow-ups"
              value={data?.todaysFollowupsCount || 0}
              subtitle="Actions due today"
              href="/follow-ups"
              color="green"
            />
          </>
        )}
      </div>

      {/* Recent Documents */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            Recently Uploaded Files
          </h2>
          <Link href="/upload" className="text-sm text-blue-600 hover:underline">
            Upload more
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))
          ) : data?.recentDocuments.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No files uploaded yet.</p>
              <Link href="/upload" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                Upload your first file
              </Link>
            </div>
          ) : (
            data?.recentDocuments.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{doc.file_name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 uppercase font-medium">
                    {doc.file_type}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      doc.structured
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {doc.structured ? 'Processed' : 'Pending'}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(doc.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
