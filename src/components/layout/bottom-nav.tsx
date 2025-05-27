
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomNavItems, getLucideIcon } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="sticky bottom-0 left-0 right-0 z-20 border-t bg-card shadow-lg md:hidden"> {/* Changed shadow-t-lg to shadow-lg, kept border-t */}
      <nav className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const IconComponent = typeof item.icon === 'string' ? getLucideIcon(item.icon) : item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.title} // Using title as key, ensure titles are unique
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
    </footer>
  );
}
