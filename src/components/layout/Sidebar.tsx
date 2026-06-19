'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Users,
  ShoppingCart,
  Truck,
  Bell,
  Search,
  MessageSquare,
  Database,
  LogOut,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Files', icon: Upload },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/follow-ups', label: 'Follow-ups', icon: Bell },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/chat', label: 'AI Assistant', icon: MessageSquare },
  { href: '/demo-data', label: 'Demo Data', icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-gray-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">CortexAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600 rounded-l-none'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
