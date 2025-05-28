
"use client"; // Make this a client component to use QueryClientProvider & useAuth
import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Leaf } from 'lucide-react';
import { UserNav } from '@/components/layout/user-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// export const metadata: Metadata = { // Metadata should be in a Server Component parent or root layout
//   title: `${APP_NAME} - Plant Monitor`,
//   description: `Monitor your ${APP_NAME} plant care system.`,
// };

// Create a client
const queryClient = new QueryClient();

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-card-foreground" />
            <span className="text-lg font-semibold text-card-foreground sm:text-xl">{APP_NAME}</span>
          </Link>
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-20"> {/* Ensure pb-20 for bottom nav */}
          {children}
        </main>
        <BottomNav />
      </div>
    </QueryClientProvider>
  );
}
