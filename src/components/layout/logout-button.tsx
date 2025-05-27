
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useRouter } from "next/navigation";
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from "@/hooks/use-toast";
import React from 'react'; // Import React

export function LogoutButton({className}: {className?: string}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
      router.refresh(); // Ensure layout reflects logout state
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message || 'Could not log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-5 w-5" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}

