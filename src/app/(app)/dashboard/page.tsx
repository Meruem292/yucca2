
"use client";
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserStats, getUserDevices } from '@/lib/firebase/rtdb';
import type { UserStats, FirebaseDevice, DashboardAlert } from '@/lib/firebase/types';

import { DeviceSummaryCard } from '@/components/dashboard/device-summary-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { AlertListItem } from '@/components/dashboard/alert-list-item';
import { OverallLevelsChart } from '@/components/dashboard/overall-levels-chart'; // New
import { AlertSummaryChart } from '@/components/dashboard/alert-summary-chart'; // New
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Clock, Leaf, AlertTriangle, CheckCircle2, PackageSearch, Droplets, Thermometer, PlusCircle, TrendingUp } from 'lucide-react'; // Added TrendingUp
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

  const [dashboardAlerts, setDashboardAlerts] = useState<DashboardAlert[]>([]);

  useEffect(() => {
    if (devices && devices.length > 0) {
      const newAlerts: DashboardAlert[] = [];
      devices.forEach(device => {
        if (!device.key) return; 

        let waterLevelPercent = -1;
        const currentWaterDepth = device.readings?.waterLevel;
        const waterContainerHeight = device.config?.containerHeights?.water;
        if (currentWaterDepth !== undefined) {
          if (waterContainerHeight && waterContainerHeight > 0) {
            waterLevelPercent = Math.max(0, Math.min(100, (currentWaterDepth / waterContainerHeight) * 100));
          } else if ((!waterContainerHeight || waterContainerHeight <= 0) && currentWaterDepth >= 0 && currentWaterDepth <= 100) {
            waterLevelPercent = currentWaterDepth; 
          }
        }

        if (waterLevelPercent !== -1) {
          const waterThreshold = device.config?.alertThresholds?.water ?? 20;
          if (waterLevelPercent < waterThreshold) {
            newAlerts.push({
              id: `${device.key}-low-water`,
              deviceId: device.key,
              deviceName: device.name,
              type: 'low_water',
              message: `Water level critical (${waterLevelPercent.toFixed(0)}%). Threshold: ${waterThreshold}%`,
              timestamp: device.lastUpdated,
              severity: 'warning',
            });
          }
        }

        let fertilizerLevelPercent = -1;
        const currentFertilizerDepth = device.readings?.fertilizerLevel;
        const fertilizerContainerHeight = device.config?.containerHeights?.fertilizer;
        if (currentFertilizerDepth !== undefined) {
          if (fertilizerContainerHeight && fertilizerContainerHeight > 0) {
            fertilizerLevelPercent = Math.max(0, Math.min(100, (currentFertilizerDepth / fertilizerContainerHeight) * 100));
          } else if ((!fertilizerContainerHeight || fertilizerContainerHeight <= 0) && currentFertilizerDepth >= 0 && currentFertilizerDepth <= 100) {
            fertilizerLevelPercent = currentFertilizerDepth; 
          }
        }
        
        if (fertilizerLevelPercent !== -1) {
          const fertilizerThreshold = device.config?.alertThresholds?.fertilizer ?? 20;
          if (fertilizerLevelPercent < fertilizerThreshold) {
            newAlerts.push({
              id: `${device.key}-low-fertilizer`,
              deviceId: device.key,
              deviceName: device.name,
              type: 'low_fertilizer',
              message: `Fertilizer level critical (${fertilizerLevelPercent.toFixed(0)}%). Threshold: ${fertilizerThreshold}%`,
              timestamp: device.lastUpdated,
              severity: 'warning',
            });
          }
        }

        if (device.manualControl?.waterPumpActive) {
          newAlerts.push({
            id: `${device.key}-pump-water-active`,
            deviceId: device.key,
            deviceName: device.name,
            type: 'pump_active_water',
            message: 'Water pump manually activated.',
            timestamp: device.lastUpdated,
            severity: 'info',
          });
        }

        if (device.manualControl?.fertilizerPumpActive) {
          newAlerts.push({
            id: `${device.key}-pump-fertilizer-active`,
            deviceId: device.key,
            deviceName: device.name,
            type: 'pump_active_fertilizer',
            message: 'Fertilizer pump manually activated.',
            timestamp: device.lastUpdated,
            severity: 'info',
          });
        }
      });

      newAlerts.sort((a, b) => {
        if (a.severity === 'warning' && b.severity !== 'warning') return -1;
        if (a.severity !== 'warning' && b.severity === 'warning') return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setDashboardAlerts(newAlerts);
    } else {
      setDashboardAlerts([]);
    }
  }, [devices]);


  if (authLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" /> {/* For overall charts */}
        <Skeleton className="h-64 w-full rounded-lg" /> {/* For device analytics */}
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
      <div className="rounded-lg bg-[hsl(var(--dashboard-banner-background))] p-6 shadow hover:shadow-lg transition-shadow duration-300">
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

      <section>
         <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              <>
                <StatCard title="Active Plants" value={0} icon={Leaf} isLoading={true} />
                <StatCard title="Active Sensors" value={0} icon={Thermometer} isLoading={true} />
                <StatCard title="Water Level" value={"0%"} icon={Droplets} isLoading={true} />
                <StatCard title="Fertilizer Level" value={"0%"} icon={PackageSearch} isLoading={true} />
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
                  icon={PackageSearch}
                />
              </>
            )}
          </div>
      </section>

      {/* Overall System Status Charts - New Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Overall System Status</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <OverallLevelsChart 
            waterLevel={userStats?.waterLevel ?? 0} 
            fertilizerLevel={userStats?.fertilizerLevel ?? 0} 
            isLoading={statsLoading} 
          />
          <AlertSummaryChart 
            alerts={dashboardAlerts} 
            isLoading={authLoading || devicesLoading} 
          />
        </div>
      </section>

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
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
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

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent Activity & Alerts</h2>
        </div>
        <Card className="shadow-sm rounded-lg">
            <CardHeader className="flex flex-row items-center space-x-3 rounded-t-lg bg-[hsl(var(--attention-header-background))] p-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--attention-header-foreground))]" />
            <CardTitle className="text-md font-semibold text-[hsl(var(--attention-header-foreground))]">
                Alerts & Manual Pump Activity
            </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            {authLoading || devicesLoading ? (
                <div className="p-6 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : dashboardAlerts.length > 0 ? (
                <div className="divide-y divide-border">
                    {dashboardAlerts.map((alert) => (
                        <AlertListItem key={alert.id} alert={alert} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-2" />
                    <p className="text-lg sm:text-xl font-semibold text-card-foreground">All Clear!</p>
                    <p className="text-sm text-muted-foreground">No critical alerts or recent manual activity to show.</p>
                </div>
            )}
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
