'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, AlertCircle, DollarSign, ShoppingCart, Users, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getDaysOverdue } from '@/lib/utils';
import { toast } from 'sonner';
import type { FollowUp } from '@/types/database';

const TYPE_ICONS: Record<FollowUp['type'], React.ReactNode> = {
  payment: <DollarSign className="h-4 w-4" />,
  order: <ShoppingCart className="h-4 w-4" />,
  customer: <Users className="h-4 w-4" />,
  supplier: <Truck className="h-4 w-4" />,
};

const TYPE_COLORS: Record<FollowUp['type'], string> = {
  payment: 'bg-red-50 border-red-100',
  order: 'bg-amber-50 border-amber-100',
  customer: 'bg-blue-50 border-blue-100',
  supplier: 'bg-purple-50 border-purple-100',
};

const ICON_COLORS: Record<FollowUp['type'], string> = {
  payment: 'bg-red-100 text-red-600',
  order: 'bg-amber-100 text-amber-600',
  customer: 'bg-blue-100 text-blue-600',
  supplier: 'bg-purple-100 text-purple-600',
};

function FollowUpCard({ followUp, onMarkDone }: { followUp: FollowUp; onMarkDone: (id: string) => void }) {
  const daysOverdue = followUp.due_date ? getDaysOverdue(followUp.due_date) : 0;
  const isOverdue = daysOverdue > 0;

  return (
    <div className={`flex items-start gap-4 rounded-lg border p-4 ${TYPE_COLORS[followUp.type]}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_COLORS[followUp.type]}`}>
        {TYPE_ICONS[followUp.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{followUp.title}</p>
            {followUp.description && (
              <p className="text-xs text-gray-500 mt-0.5">{followUp.description}</p>
            )}
          </div>
          <Badge variant={followUp.type === 'payment' ? 'destructive' : 'warning'}>
            {followUp.type}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {followUp.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {isOverdue ? `${daysOverdue}d overdue` : `Due ${formatDate(followUp.due_date)}`}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs gap-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
            onClick={() => onMarkDone(followUp.id)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FollowUpsContent() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchFollowUps() {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) {
        setError('Failed to load follow-ups. Please refresh.');
      } else {
        setFollowUps((data || []) as FollowUp[]);
      }
      setLoading(false);
    }
    fetchFollowUps();
  }, [supabase]);

  const handleMarkDone = async (id: string) => {
    const { error } = await supabase
      .from('follow_ups')
      .update({ status: 'done' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update follow-up.');
    } else {
      setFollowUps((prev) => prev.filter((f) => f.id !== id));
      toast.success('Follow-up marked as done!');
    }
  };

  const overdue = followUps.filter((f) => f.due_date && getDaysOverdue(f.due_date) > 0);
  const upcoming = followUps.filter((f) => !f.due_date || getDaysOverdue(f.due_date) <= 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No pending follow-ups.</p>
          <Link href="/upload" className="text-sm text-blue-600 hover:underline">
            Upload files to auto-generate follow-ups
          </Link>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Overdue ({overdue.length})
              </h2>
              <div className="space-y-3">
                {overdue.map((f) => (
                  <FollowUpCard key={f.id} followUp={f} onMarkDone={handleMarkDone} />
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((f) => (
                  <FollowUpCard key={f.id} followUp={f} onMarkDone={handleMarkDone} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
