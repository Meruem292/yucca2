
import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Leaf } from 'lucide-react';
import { UserNav } from '@/components/layout/user-nav'; // Changed from LogoutButton
import { BottomNav } from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: `${APP_NAME} - Plant Monitor`,
  description: `Monitor your ${APP_NAME} plant care system.`,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[hsl(var(--header-background))] px-4 shadow-sm sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-lg font-semibold text-[hsl(var(--header-foreground))] sm:text-xl">{APP_NAME}</span>
        </Link>
        <UserNav />
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-20"> {/* Added pb-20 for bottom nav */}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
