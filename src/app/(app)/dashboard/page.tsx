
"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getUserDevices } from '@/lib/firebase/rtdb';
import type { UserStats, FirebaseDevice } from '@/lib/firebase/types';

import { DeviceSummaryCard } from '@/components/dashboard/device-summary-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added
import Link from 'next/link'; // Added
import { BarChart3, Clock, Leaf, AlertTriangle, CheckCircle2, PackageSearch, Droplets, Thermometer, Wind, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;

  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery<UserStats | null>({
    queryKey: ['userStats', userId],
    queryFn: () => userId ? getUserStats(userId) : Promise.resolve(null),
    enabled: !!userId,
  });

  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery<FirebaseDevice[]>({
    queryKey: ['userDevices', userId],
    queryFn: () => userId ? getUserDevices(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Example data for "Plants Needing Attention" - can be dynamic based on actual device data later
  const plantsHealthy = true; // Placeholder: derive this from device statuses or critical readings

  if (authLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }
  
  if (!userId) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  if (statsError || devicesError) {
    return <p className="text-destructive">Error loading dashboard data. Please try again later.</p>;
  }

  const activePlants = userStats?.activePlants ?? devices?.length ?? 0;
  const activeSensors = userStats?.activeSensors ?? (devices?.reduce((acc, dev) => acc + Object.keys(dev.readings || {}).length, 0) || 0);


  return (
    <div className="space-y-8">
      {/* Dashboard Banner */}
      <div className="rounded-lg bg-[hsl(var(--dashboard-banner-background))] p-6 shadow">
        <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-[hsl(var(--dashboard-banner-title-foreground))]" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--dashboard-banner-title-foreground))]">Dashboard</h1>
                <p className="text-[hsl(var(--dashboard-banner-foreground))]">
                Monitor your plant care system
                </p>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section>
         <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
              </>
            ) : (
              <>
                <StatCard title="Active Plants" value={activePlants} icon={Leaf} />
                <StatCard title="Active Sensors" value={activeSensors} icon={Thermometer} /> 
                <StatCard 
                  title="Water Level" 
                  value={`${userStats?.waterLevel ?? 0}%`} 
                  icon={Droplets} 
                  description={(userStats?.waterLevel ?? 100) < 20 ? "(Low!)" : undefined}
                  descriptionClassName={(userStats?.waterLevel ?? 100) < 20 ? "text-destructive font-semibold" : undefined}
                />
                <StatCard 
                  title="Fertilizer Level" 
                  value={`${userStats?.fertilizerLevel ?? 0}%`} 
                  icon={PackageSearch} // Using PackageSearch as a stand-in for fertilizer icon
                />
              </>
            )}
          </div>
      </section>


      {/* Device Analytics Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Device Analytics</h2>
            </div>
             <Button asChild variant="outline" size="sm">
                <Link href="/devices/register">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Device
                </Link>
            </Button>
        </div>
        {devicesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[280px] rounded-xl" />
                <Skeleton className="h-[280px] rounded-xl" />
                <Skeleton className="h-[280px] rounded-xl" />
            </div>
        ) : devices && devices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <DeviceSummaryCard key={device.key} device={device} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-10">
            <CardContent>
              <p className="text-muted-foreground">No devices registered yet.</p>
              <Button asChild className="mt-4">
                 <Link href="/devices/register">Register Your First Device</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity / Alerts Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent Activity / Alerts</h2>
        </div>
        <Card className="shadow-sm rounded-lg">
            <CardHeader className="flex flex-row items-center space-x-3 rounded-t-lg bg-[hsl(var(--attention-header-background))] p-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--attention-header-foreground))]" />
            <CardTitle className="text-md font-semibold text-[hsl(var(--attention-header-foreground))]">
                Plants Needing Attention
            </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 text-center">
            {plantsHealthy ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-2" />
                <p className="text-lg sm:text-xl font-semibold text-card-foreground">All Plants Are Healthy</p>
                <p className="text-sm text-muted-foreground">No actions required at this time.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-2" />
                <p className="text-lg sm:text-xl font-semibold text-destructive">Some plants need attention!</p>
                <p className="text-sm text-muted-foreground">Check device details for more information.</p>
                </div>
            )}
            {/* Placeholder for other recent activities */}
            {/* <p className="text-xs text-muted-foreground mt-4">No other recent activity.</p> */}
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
