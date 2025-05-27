
"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserDevices } from '@/lib/firebase/rtdb';
import type { FirebaseDevice } from '@/lib/firebase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings/settings-form';
import { Plus, Settings as SettingsIcon, ListChecks, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;

  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery<FirebaseDevice[]>({
    queryKey: ['userDevices', userId],
    queryFn: () => (userId ? getUserDevices(userId) : Promise.resolve([])),
    enabled: !!userId && !authLoading,
  });

  if (authLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (!userId && !authLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Please log in to view settings.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="bg-[hsl(var(--settings-card-background))] text-[hsl(var(--settings-card-foreground))] p-6 rounded-lg shadow">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="opacity-80 mt-1">Manage your Yucca devices and notification preferences.</p>
      </div>

      {/* Device Configuration Card */}
      <Card className="bg-[hsl(var(--settings-card-background))] text-[hsl(var(--settings-card-foreground))] shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            <CardTitle className="text-xl">Device Configuration</CardTitle>
          </div>
          <CardDescription className="text-[hsl(var(--settings-card-foreground))] opacity-80">
            Select a device to view or modify its specific settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devicesLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </>
          ) : devicesError ? (
             <p className="text-destructive text-sm flex items-center gap-2">
                <Info className="h-4 w-4" /> Could not load devices. Please try again.
            </p>
          ) : devices && devices.length > 0 ? (
            devices.map((device) => (
              <Link key={device.key} href={`/devices/${device.key}`} passHref>
                <div className="flex items-center justify-between p-3 hover:bg-primary/10 rounded-md transition-colors cursor-pointer border border-border bg-card/30">
                  <div>
                    <p className="font-semibold">{device.name}</p>
                    <p className="text-sm opacity-70">{device.location || 'No location set'}</p>
                  </div>
                  <SettingsIcon className="h-5 w-5 text-primary" />
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-center py-4">No devices registered yet.</p>
          )}
          <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/devices/register">
              <Plus className="mr-2 h-4 w-4" /> Add New Device
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* SMS Notifications and Actions Card */}
      <SettingsForm />
    </div>
  );
}
