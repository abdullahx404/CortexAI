'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  ShoppingCart,
  Truck,
  Bell,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InsertedCounts {
  customers: number;
  orders: number;
  suppliers: number;
  follow_ups: number;
  documents: number;
}

const demoQuestions = [
  { q: 'Which customers owe us money?', hint: 'Try in the AI Assistant' },
  { q: 'Who is the cheapest supplier for office chairs?', hint: 'Try in Suppliers or AI Assistant' },
  { q: 'What orders are still pending?', hint: 'Try in Orders or AI Assistant' },
  { q: 'What did we discuss with Ahmed?', hint: 'Try in Search or AI Assistant' },
  { q: 'What were last month\'s sales?', hint: 'Try in AI Assistant' },
];

export function DemoDataLoader() {
  const [loading, setLoading] = useState(false);
  const [inserted, setInserted] = useState<InsertedCounts | null>(null);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    setInserted(null);

    try {
      const res = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear_existing: true }),
      });

      const data = await res.json();

      if (data.success) {
        setInserted(data.inserted);
        toast.success('Demo data loaded successfully!');
      } else {
        setError(data.error || 'Failed to load demo data.');
        toast.error('Failed to load demo data.');
      }
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = inserted
    ? Object.values(inserted).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Sample SME Business Dataset</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Loads realistic business data including customers with pending payments, overdue orders,
              supplier price comparisons, and daily follow-ups. This covers all 5 demo questions.
            </p>
          </div>
        </div>

        {/* What gets loaded */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Users, label: '15 Customers', desc: 'With various payment statuses' },
            { icon: ShoppingCart, label: '20 Orders', desc: 'Mix of pending, overdue, completed' },
            { icon: Truck, label: '8 Suppliers', desc: 'With price comparisons' },
            { icon: Bell, label: '10 Follow-ups', desc: 'From payments and orders' },
            { icon: FileText, label: '1 Document', desc: 'Meeting notes from June' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
              <Icon className="h-4 w-4 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 mb-5">
          <strong>Warning:</strong> This will clear all existing data in your database before loading the demo.
        </div>

        <Button
          onClick={handleLoad}
          disabled={loading}
          size="lg"
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading demo data...
            </>
          ) : (
            <>
              <Database className="h-5 w-5" />
              Load Demo Data
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success state */}
      {inserted && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Demo data loaded!</p>
              <p className="text-sm text-green-600">{total} records inserted across all tables</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-5">
            {Object.entries(inserted).map(([key, count]) => (
              <div key={key} className="text-center rounded-lg bg-white border border-green-200 py-2">
                <p className="text-lg font-bold text-green-700">{count}</p>
                <p className="text-xs text-green-600 capitalize">{key.replace('_', ' ')}</p>
              </div>
            ))}
          </div>

          <Link href="/dashboard">
            <Button className="w-full gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Demo questions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Try these demo questions</h3>
        <div className="space-y-3">
          {demoQuestions.map(({ q, hint }) => (
            <div key={q} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">&ldquo;{q}&rdquo;</p>
                <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
              </div>
              <Link href="/chat" className="shrink-0 text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                Ask AI <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
