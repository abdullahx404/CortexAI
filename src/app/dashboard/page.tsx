export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { DashboardContent } from './DashboardContent';

export const metadata = {
  title: 'Dashboard — CortexAI',
};

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
