
"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams, notFound, useRouter } from 'next/navigation'; // useRouter might be needed if we redirect invalid sensor types
import { useAuth } from '@/hooks/useAuth';

import { getDeviceDetails, getDeviceHistory } from '@/lib/firebase/rtdb';
import type { FirebaseDevice, DeviceHistoryEntry, DeviceSensorReadings } from '@/lib/firebase/types';
import type { SensorType } from '@/lib/constants'; // Keep this for general sensor type concept
import { SENSOR_DISPLAY_NAMES, HISTORY_SENSOR_TYPES, getLucideIcon, SENSOR_ICON_NAMES } from '@/lib/constants';

import { SensorHistoryChart } from '@/components/charts/sensor-history-chart';
import { TemperatureHistoryChart } from '@/components/charts/temperature-history-chart';
import { RecentReadingsTable } from '@/components/devices/recent-readings-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Map Firebase reading keys to their legacy SensorType for icons/display names
const firebaseToLegacySensorMap: Record<keyof DeviceSensorReadings, SensorType> = {
  soilMoisture: 'soil_moisture',
  soilTemperature: 'soil_temperature',
  airTemperature: 'air_temperature',
  airHumidity: 'air_humidity',
  waterLevel: 'water_level',
  fertilizerLevel: 'fertilizer_level',
};

export default function SensorHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter(); // Keep for potential redirects

  const deviceId = typeof params.deviceId === 'string' ? params.deviceId : undefined;
  const initialSensorType = typeof params.sensorType === 'string' ? params.sensorType as SensorType : 'temperature'; // Default to 'temperature'
  const userId = user?.uid;

  const { data: device, isLoading: deviceLoading, error: deviceError } = useQuery<FirebaseDevice | null>({
    queryKey: ['deviceDetails', userId, deviceId],
    queryFn: () => (userId && deviceId) ? getDeviceDetails(userId, deviceId) : Promise.resolve(null),
    enabled: !!userId && !!deviceId,
  });

  const { data: historyData, isLoading: historyLoading, error: historyError } = useQuery<DeviceHistoryEntry[]>({
    queryKey: ['deviceHistory', userId, deviceId],
    queryFn: () => (userId && deviceId) ? getDeviceHistory(userId, deviceId) : Promise.resolve([]),
    enabled: !!userId && !!deviceId,
  });

  // Validate initialSensorType against HISTORY_SENSOR_TYPES
  const isValidInitialTab = HISTORY_SENSOR_TYPES.some(tab => tab.id === initialSensorType);
  const activeTabOrDefault = isValidInitialTab ? initialSensorType : 'temperature';


  if (authLoading || (deviceLoading && !device) || (historyLoading && !historyData)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" /> {/* TabsList skeleton */}
        <Skeleton className="h-80 w-full" /> {/* Chart skeleton */}
        <Skeleton className="h-64 w-full" /> {/* Table skeleton */}
      </div>
    );
  }

  if (!userId && !authLoading) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Please log in to view device history.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (deviceError || historyError) {
    return <p className="text-destructive">Error loading device history: {(deviceError || historyError)?.message}</p>;
  }

  if (!device && !deviceLoading) {
    notFound();
    return null;
  }
  
  const getPageTitle = (activeTab: SensorType) => {
    const displayName = SENSOR_DISPLAY_NAMES[activeTab] || "Sensor";
    return `${displayName} History for ${device?.name || 'Device'}`;
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <Button variant="outline" asChild className="mb-2 sm:mb-0">
                <Link href={`/devices/${deviceId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {device?.name || 'Device'}
                </Link>
            </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTabOrDefault} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 mb-6">
          {HISTORY_SENSOR_TYPES.map((tab) => {
            const Icon = getLucideIcon(tab.icon);
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="soil_moisture">
          <SensorHistoryChart
            fullHistoryData={historyData || []}
            dataKeyToPlot="soilMoisture"
            unit="%"
            title={`${SENSOR_DISPLAY_NAMES['soil_moisture']} History for ${device?.name || 'Device'}`}
            iconName="Droplets"
          />
        </TabsContent>
        <TabsContent value="temperature">
          <TemperatureHistoryChart 
            fullHistoryData={historyData || []} 
            title={`Temperature History for ${device?.name || 'Device'}`}
            deviceId={deviceId!}
          />
        </TabsContent>
        <TabsContent value="air_humidity">
          <SensorHistoryChart
            fullHistoryData={historyData || []}
            dataKeyToPlot="airHumidity"
            unit="%"
            title={`${SENSOR_DISPLAY_NAMES['air_humidity']} History for ${device?.name || 'Device'}`}
            iconName="CloudRain"
          />
        </TabsContent>
      </Tabs>

      <RecentReadingsTable deviceHistory={historyData || []} deviceId={deviceId!} />
    </div>
  );
}

// generateStaticParams is removed as this page is now dynamic
