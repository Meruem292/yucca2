
"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserDevices } from '@/lib/firebase/rtdb';
import type { FirebaseDevice } from '@/lib/firebase/types';
import { Button } from '@/components/ui/button';
import { DeviceListItem } from '@/components/devices/device-list-item';
import { PlusCircle, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DevicesPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;

  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery<FirebaseDevice[]>({
    queryKey: ['userDevices', userId],
    queryFn: () => userId ? getUserDevices(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[200px] rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!userId && !authLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Please log in to view your devices.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (devicesError) {
    return <p className="text-destructive">Error loading devices. Please try again later.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Devices</h1>
          <p className="text-muted-foreground">
            Manage your registered Yucca devices or add a new one.
          </p>
        </div>
        <Button asChild>
          <Link href="/devices/register">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New Device
          </Link>
        </Button>
      </div>

      {devicesLoading ? (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[200px] rounded-xl" />)}
        </div>
      ) : devices && devices.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <WifiOff className="mr-3 h-8 w-8 text-muted-foreground" />
              No Devices Registered
            </CardTitle>
            <CardDescription>
              It looks like you haven&apos;t added any Yucca devices yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="https://placehold.co/300x200.png" 
              alt="Stylized illustration of a disconnected or empty state for devices" 
              data-ai-hint="empty state devices"
              className="mx-auto mb-6 rounded-lg shadow-md" 
            />
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild size="lg">
              <Link href="/devices/register">
                <PlusCircle className="mr-2 h-4 w-4" />
                Register Your First Device
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices?.map((device) => (
            <DeviceListItem key={device.key} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
