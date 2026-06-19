export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { FollowUpsContent } from './FollowUpsContent';

export const metadata = { title: 'Follow-ups — CortexAI' };

export default function FollowUpsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Follow-up Center</h1>
        <p className="text-sm text-gray-500 mt-1">Daily action list from overdue orders and pending payments</p>
      </div>
      <FollowUpsContent />
    </AppShell>
  );
}
