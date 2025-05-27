import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME, mainNavItems } from '@/lib/constants';
import { YuccaLogo } from '@/components/icons/yucca-logo';
import { UserNav } from '@/components/layout/user-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar'; // Using the provided complex sidebar
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: `${APP_NAME} Dashboard`,
  description: `Manage your ${APP_NAME} devices.`,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <YuccaLogo className="h-8 w-auto text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
             <YuccaLogo className="h-8 w-auto text-sidebar-foreground hidden group-data-[collapsible=icon]:block" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={{ children: item.title, className: "bg-primary text-primary-foreground"}} 
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
          {/* Add footer items if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
            <h1 className="text-xl font-semibold">{APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
