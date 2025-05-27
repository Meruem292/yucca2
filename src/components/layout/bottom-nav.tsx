
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomNavItems, getLucideIcon } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <footer className="sticky bottom-0 left-0 right-0 z-20 border-t bg-card shadow-lg"> {/* Removed md:hidden */}
      {/* Only render nav content once mounted on the client to prevent hydration mismatch */}
      {isMounted ? (
        <nav className="flex h-16 items-center justify-around px-2"> {/* Removed mx-auto and max-w-md for simplicity, can be added back if needed for specific centering on larger small screens */}
          {bottomNavItems.map((item) => {
            const IconComponent = typeof item.icon === 'string' ? getLucideIcon(item.icon) : item.icon as LucideIcon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors duration-150 ease-in-out hover:bg-muted/50",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                aria-disabled={item.disabled}
                aria-current={isActive ? "page" : undefined}
              >
                {IconComponent && <IconComponent className="h-5 w-5 shrink-0" />}
                <span className="text-[0.6rem] font-medium leading-tight tracking-tighter">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      ) : null} {/* Explicitly render null when not mounted to ensure server/client match */}
    </footer>
  );
}

