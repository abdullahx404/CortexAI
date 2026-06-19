export const dynamic = 'force-dynamic';

import { AppShell } from '@/components/layout/AppShell';
import { ChatWindow } from './ChatWindow';

export const metadata = { title: 'AI Assistant — CortexAI' };

export default function ChatPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">Ask questions about your business data in plain English</p>
      </div>
      <ChatWindow />
    </AppShell>
  );
}
