
"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getDeviceDetails } from '@/lib/firebase/rtdb';
import type { FirebaseDevice, DeviceSensorReadings } from '@/lib/firebase/types';
import { SENSOR_DISPLAY_NAMES, SENSOR_ICON_NAMES, getLucideIcon, type SensorType as LegacySensorType } from '@/lib/constants';
import { useParams, notFound, useRouter } from 'next/navigation';

import { SensorCard } from '@/components/dashboard/sensor-card';
import { ConfigureDeviceForm } from '@/components/devices/configure-device-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Map Firebase reading keys to their legacy SensorType for icons/display names
// This ensures compatibility with existing SENSOR_DISPLAY_NAMES and SENSOR_ICON_NAMES
const firebaseToLegacySensorMap: Record<keyof DeviceSensorReadings, LegacySensorType> = {
  soilMoisture: 'soil_moisture',
  soilTemperature: 'soil_temperature',
  airTemperature: 'air_temperature',
  airHumidity: 'air_humidity',
  waterLevel: 'water_level',
  fertilizerLevel: 'fertilizer_level',
};

export default function DeviceDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deviceId = typeof params.deviceId === 'string' ? params.deviceId : undefined;
  const userId = user?.uid;

  const { data: device, isLoading: deviceLoading, error: deviceError } = useQuery<FirebaseDevice | null>({
    queryKey: ['deviceDetails', userId, deviceId],
    queryFn: () => (userId && deviceId) ? getDeviceDetails(userId, deviceId) : Promise.resolve(null),
    enabled: !!userId && !!deviceId && !authLoading,
  });

  if (authLoading || (deviceLoading && !device)) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Please log in to view device details.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  if (deviceError) {
    return (
      <div className="text-center py-10 text-destructive">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">Error loading device details.</p>
        <p>Could not load device: {deviceError.message}</p>
        <Button variant="outline" asChild className="mt-4">
            <Link href="/devices"><ArrowLeft className="mr-2 h-4 w-4" />Back to Devices</Link>
        </Button>
      </div>
    );
  }

  if (!device && !deviceLoading) {
    notFound(); 
    return null;
  }
  
  const getUnitForSensor = (sensorKey: keyof DeviceSensorReadings) => {
    if (sensorKey.toLowerCase().includes('temperature')) return '°C';
    if (sensorKey.toLowerCase().includes('humidity') || sensorKey.toLowerCase().includes('moisture') || sensorKey.toLowerCase().includes('level')) return '%';
    return '';
  };

  // Create an array of sensor data for rendering SensorCard components
  const sensorEntries = device?.readings ? 
    (Object.keys(device.readings) as Array<keyof DeviceSensorReadings>)
    .filter(key => firebaseToLegacySensorMap[key] !== undefined) // Ensure it's a mapped sensor
    .map(key => {
      const legacySensorType = firebaseToLegacySensorMap[key];
      const value = device.readings![key];
      return {
        id: legacySensorType, // This is the SensorType used for history links and icons
        name: SENSOR_DISPLAY_NAMES[legacySensorType] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: value !== undefined && value !== null ? value : 'N/A',
        unit: getUnitForSensor(key),
        iconName: SENSOR_ICON_NAMES[legacySensorType] || 'PackageSearch', // Fallback icon
        lastUpdated: device.lastUpdated ? new Date(device.lastUpdated).toLocaleTimeString() : 'N/A',
      };
    }) : [];

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-3xl font-bold">{device?.name || 'Device Details'}</CardTitle>
              <CardDescription className="text-md">Unique ID: {device?.id}</CardDescription>
            </div>
            <Badge
              variant={device?.isConnected !== false ? 'default' : 'destructive'}
              className={`mt-2 sm:mt-0 px-3 py-1 text-sm ${device?.isConnected !== false ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}
            >
              {device?.isConnected !== false ? 'Connected & Online' : 'Offline'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Sensor Readings</h2>
            {deviceLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[130px] rounded-lg" />)}
              </div>
            ) : sensorEntries.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {sensorEntries.map((sensor) => (
                  <SensorCard 
                    key={sensor.id} 
                    sensorId={sensor.id as LegacySensorType} 
                    name={sensor.name}
                    value={sensor.value}
                    unit={sensor.unit}
                    iconName={sensor.iconName as keyof typeof SENSOR_ICON_NAMES}
                    lastUpdated={sensor.lastUpdated}
                    deviceId={deviceId!} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No sensor readings available for this device.</p>
            )}
          </section>

          <section>
            {/* Ensure ConfigureDeviceForm is updated to handle FirebaseDevice */}
            {device && deviceId && <ConfigureDeviceForm device={device} />}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

// generateStaticParams is removed as this page is now dynamic based on Firebase data
