export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { MessageSquare } from 'lucide-react';

export const metadata = { title: 'AI Assistant — CortexAI' };

export default function ChatPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">Ask questions about your business data in plain English</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">AI chatbot coming in Phase 4</p>
      </div>
    </AppShell>
  );
}
