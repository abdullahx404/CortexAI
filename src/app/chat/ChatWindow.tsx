'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  table_used?: string | null;
  record_count?: number;
  isLoading?: boolean;
  isError?: boolean;
}

const EXAMPLE_QUESTIONS = [
  'Which customers owe us money?',
  'What orders are overdue?',
  'Who is the cheapest supplier for office chairs?',
  'What is the total pending payment amount?',
  'Show me all pending orders',
];

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question.trim(),
    };

    const loadingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'bot',
      content: '',
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: loadingMsg.id,
        role: 'bot',
        content: data.success
          ? data.answer
          : data.error || 'Something went wrong. Please try again.',
        table_used: data.table_used,
        record_count: data.record_count,
        isError: !data.success,
      };

      setMessages((prev) => prev.map((m) => (m.id === loadingMsg.id ? botMsg : m)));
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, content: 'Network error. Please try again.', isLoading: false, isError: true }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
              <MessageSquare className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Ask about your business data</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              I can answer questions about your customers, orders, suppliers, and follow-ups.
            </p>
            <div className="space-y-2 w-full max-w-sm">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex items-start gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                )}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>

              {/* Bubble */}
              <div className={cn('max-w-[75%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  )}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      <span className="text-gray-400 text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {/* Source footer */}
                {msg.role === 'bot' && !msg.isLoading && msg.table_used && (
                  <p className="text-xs text-gray-400 px-1">
                    From {msg.table_used} table · {msg.record_count} record{msg.record_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your customers, orders, suppliers..."
            disabled={isLoading}
            className="flex-1 bg-white"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Only answers questions about your uploaded business data
        </p>
      </div>
    </div>
  );
}
