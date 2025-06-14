
"use client";
import Link from 'next/link';
import type { FirebaseDevice } from '@/lib/firebase/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Smartphone, Thermometer, Droplets, CloudRain } from 'lucide-react';
import { getLucideIcon } from '@/lib/constants'; // Assuming SENSOR_ICON_NAMES is also in constants or a similar helper exists

// Helper to get relevant sensor data for preview
const getPreviewSensors = (device: FirebaseDevice) => {
  const readings = device.readings;
  const previews = [];
  if (readings.soilMoisture !== undefined) {
    previews.push({ id: 'soilMoisture', name: 'Soil', value: readings.soilMoisture, unit: '%', icon: Droplets });
  }
  if (readings.soilTemperature !== undefined) {
    previews.push({ id: 'soilTemperature', name: 'Soil Temp', value: readings.soilTemperature, unit: '°C', icon: Thermometer });
  }
  if (readings.airHumidity !== undefined) {
    previews.push({ id: 'airHumidity', name: 'Air', value: readings.airHumidity, unit: '%', icon: CloudRain });
  }
  return previews.slice(0, 3);
};


export function DeviceListItem({ device }: { device: FirebaseDevice }) {
  if (!device || !device.key) {
    // This can be a skeleton or a specific loading state for the item itself.
    // For now, returning null if device.key is not available.
    return null; 
  }
  const previewSensors = getPreviewSensors(device);
  const isConnected = device.isConnected !== undefined ? device.isConnected : true; // Default to true if undefined


  return (
    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ease-in-out flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl truncate" title={device.name}>{device.name}</CardTitle>
          </div>
           <Badge 
            variant={isConnected ? 'default' : 'destructive'} 
            className={isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          >
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <CardDescription>ID: {device.id} ({device.location || 'N/A'})</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {previewSensors.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-2">Key Sensor Readings:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {previewSensors.map(sensor => {
                const Icon = sensor.icon;
                return (
                  <div key={sensor.id} className="flex flex-col items-center justify-center space-y-1 p-2 bg-muted/50 rounded-md text-center">
                    {Icon && <Icon className="h-4 w-4 text-primary mb-0.5" />}
                    <span className="font-medium">{sensor.value}{sensor.unit}</span>
                    <span className="text-muted-foreground text-[0.65rem] leading-tight">{sensor.name}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No sensor readings available.</p>
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/devices/${device.key}`}>
            Manage Device <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

