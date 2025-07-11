
"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userNavItems, getLucideIcon } from '@/lib/constants';
import { LogOut } from 'lucide-react';
import { useRouter } from "next/navigation";
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await signOutUser();
      // Navigate to login page first
      router.push('/login');
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // router.refresh(); // Removed to prevent potential flicker of current page re-rendering as "logged out"
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message || 'Could not log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  if (authLoading) {
    // Simple loading state for the button area
    return <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">...</Button>;
  }

  if (!currentUser) {
     return (
      <Button
        variant="default"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={() => router.push('/login')}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9 border-2 border-primary/70">
            <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || currentUser?.email || "User avatar"} />
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
              {getInitials(currentUser?.displayName || currentUser?.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userNavItems.map((item) => {
            const IconComponent = typeof item.icon === 'string' ? getLucideIcon(item.icon) : item.icon as LucideIcon;
            return (
              <DropdownMenuItem key={item.title} asChild disabled={item.disabled} className="cursor-pointer">
                <Link href={item.href}>
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLogoutLoading} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLogoutLoading ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
