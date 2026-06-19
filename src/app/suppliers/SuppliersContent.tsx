'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, AlertCircle, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Supplier } from '@/types/database';

type GroupedSuppliers = Record<string, Supplier[]>;

export function SuppliersContent() {
  const [grouped, setGrouped] = useState<GroupedSuppliers>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchSuppliers() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('item')
        .order('unit_price', { ascending: true });

      if (error) {
        setError('Failed to load suppliers. Please refresh.');
      } else {
        const suppliers = (data || []) as Supplier[];
        // Group by item
        const groups: GroupedSuppliers = {};
        suppliers.forEach((s) => {
          if (!groups[s.item]) groups[s.item] = [];
          groups[s.item].push(s);
        });
        setGrouped(groups);
      }
      setLoading(false);
    }
    fetchSuppliers();
  }, [supabase]);

  const items = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-sm p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-12 text-center">
          <Truck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No suppliers yet.</p>
          <Link href="/upload" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
            Upload supplier quotes to get started
          </Link>
        </div>
      ) : (
        items.map((item) => {
          const suppliers = grouped[item];
          const cheapest = suppliers[0]; // already sorted by unit_price ASC

          return (
            <div key={item} className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{item}</h2>
                <span className="text-xs text-gray-400">{suppliers.length} supplier{suppliers.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {suppliers.map((supplier) => {
                  const isCheapest = supplier.id === cheapest.id;
                  return (
                    <div
                      key={supplier.id}
                      className={`flex items-center gap-4 px-5 py-3 ${isCheapest ? 'bg-green-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{supplier.supplier_name}</p>
                          {isCheapest && suppliers.length > 1 && (
                            <Badge variant="success" className="gap-1">
                              <Trophy className="h-3 w-3" />
                              Best Price
                            </Badge>
                          )}
                        </div>
                        {supplier.lead_time && (
                          <p className="text-xs text-gray-400 mt-0.5">Lead time: {supplier.lead_time}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${isCheapest && suppliers.length > 1 ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatCurrency(supplier.unit_price)}
                        </p>
                        <p className="text-xs text-gray-400">per unit</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
