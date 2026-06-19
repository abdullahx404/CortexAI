'use client';

import { useState, useCallback } from 'react';
import { Search, Users, ShoppingCart, Truck, Bell, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Customer, Order, Supplier, FollowUp, Document } from '@/types/database';

interface SearchResults {
  customers: Customer[];
  orders: Order[];
  suppliers: Supplier[];
  follow_ups: FollowUp[];
  documents: Document[];
}

let debounceTimer: ReturnType<typeof setTimeout>;

export function SearchContent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.success) {
        setResults(data.results);
        setTotal(data.total);
      } else {
        setError(data.error || 'Search failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(val), 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      doSearch(query);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search customers, orders, suppliers, follow-ups..."
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="pl-9 h-12 text-base"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.length < 2 && !results && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Type at least 2 characters to search</p>
          <p className="text-xs text-gray-400 mt-1">Searches customers, orders, suppliers, follow-ups, and documents</p>
        </div>
      )}

      {/* No results */}
      {!loading && results && total === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Results */}
      {results && total > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{total} result{total !== 1 ? 's' : ''} for &quot;{query}&quot;</p>

          {/* Customers */}
          {results.customers.length > 0 && (
            <ResultSection title="Customers" icon={<Users className="h-4 w-4 text-blue-600" />} count={results.customers.length}>
              {results.customers.map((c) => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone || 'No phone'} · Last order: {formatDate(c.last_order)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.amount_owed > 0 && (
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(c.amount_owed)} owed</span>
                    )}
                    <Badge variant={c.status === 'active' ? 'success' : c.status === 'pending' ? 'warning' : 'secondary'}>
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Orders */}
          {results.orders.length > 0 && (
            <ResultSection title="Orders" icon={<ShoppingCart className="h-4 w-4 text-amber-600" />} count={results.orders.length}>
              {results.orders.map((o) => (
                <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.customer_name} — {o.item}</p>
                    <p className="text-xs text-gray-400">
                      {o.order_id ? `#${o.order_id} · ` : ''}Qty: {o.quantity} · Due: {formatDate(o.due_date)}
                    </p>
                  </div>
                  <Badge variant={o.status === 'overdue' ? 'destructive' : o.status === 'pending' ? 'warning' : 'success'}>
                    {o.status}
                  </Badge>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Suppliers */}
          {results.suppliers.length > 0 && (
            <ResultSection title="Suppliers" icon={<Truck className="h-4 w-4 text-green-600" />} count={results.suppliers.length}>
              {results.suppliers.map((s) => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.supplier_name}</p>
                    <p className="text-xs text-gray-400">{s.item} · Lead time: {s.lead_time || '—'}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(s.unit_price)}/unit</span>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Follow-ups */}
          {results.follow_ups.length > 0 && (
            <ResultSection title="Follow-ups" icon={<Bell className="h-4 w-4 text-purple-600" />} count={results.follow_ups.length}>
              {results.follow_ups.map((f) => (
                <div key={f.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-400">{f.description || ''} · Due: {formatDate(f.due_date)} · {f.type}</p>
                </div>
              ))}
            </ResultSection>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <ResultSection title="Documents" icon={<FileText className="h-4 w-4 text-gray-600" />} count={results.documents.length}>
              {results.documents.map((d) => (
                <div key={d.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.file_name}</p>
                    <p className="text-xs text-gray-400">{d.file_type.toUpperCase()} · {formatDate(d.created_at)}</p>
                  </div>
                  <Badge variant={d.structured ? 'success' : 'warning'}>{d.structured ? 'Processed' : 'Pending'}</Badge>
                </div>
              ))}
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        <span className="text-xs text-gray-400">{count} result{count !== 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}
