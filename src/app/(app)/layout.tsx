import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Leaf } from 'lucide-react';
import { LogoutButton } from '@/components/layout/logout-button';

export const metadata: Metadata = {
  title: `${APP_NAME} - Plant Monitor`,
  description: `Monitor your ${APP_NAME} plant care system.`,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[hsl(var(--header-background))] px-4 sm:px-6 text-[hsl(var(--header-foreground))] shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-lg sm:text-xl font-semibold">{APP_NAME} Plant Monitor</span>
        </Link>
        <LogoutButton className="bg-primary hover:bg-primary/90 text-primary-foreground" />
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
