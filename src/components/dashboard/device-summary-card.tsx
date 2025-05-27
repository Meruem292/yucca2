
"use client";
import type { FirebaseDevice, DeviceSensorReadings } from '@/lib/firebase/types';
import { SENSOR_DISPLAY_NAMES, SENSOR_ICON_NAMES, getLucideIcon, type SensorType as LegacySensorType } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Smartphone, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DeviceSummaryCardProps {
  device: FirebaseDevice;
}

// Mapping Firebase reading keys to display order and details
const SENSOR_ORDER_AND_DETAILS: { key: keyof DeviceSensorReadings, legacyId: LegacySensorType }[] = [
  { key: 'soilMoisture', legacyId: 'soil_moisture' },
  { key: 'soilTemperature', legacyId: 'soil_temperature' },
  { key: 'airTemperature', legacyId: 'air_temperature' },
  { key: 'airHumidity', legacyId: 'air_humidity' },
];

const getSensorBackgroundColor = (sensorId: LegacySensorType): string => {
  switch (sensorId) {
    case 'soil_moisture': return 'bg-[hsl(var(--sensor-soil-moisture-bg))]';
    case 'soil_temperature': return 'bg-[hsl(var(--sensor-soil-temperature-bg))]';
    case 'air_temperature': return 'bg-[hsl(var(--sensor-air-temperature-bg))]';
    case 'air_humidity': return 'bg-[hsl(var(--sensor-air-humidity-bg))]';
    default: return 'bg-muted/30';
  }
};

export function DeviceSummaryCard({ device }: DeviceSummaryCardProps) {
  if (!device || !device.key) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  const getUnit = (sensorKey: keyof DeviceSensorReadings) => {
    if (sensorKey.toLowerCase().includes('temperature')) return '°C';
    if (sensorKey.toLowerCase().includes('humidity') || sensorKey.toLowerCase().includes('moisture') || sensorKey.toLowerCase().includes('level')) return '%';
    return '';
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="p-4 bg-muted/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold truncate" title={device.name}>{device.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs whitespace-nowrap" asChild>
            <Link href={`/devices/${device.key}`}>{device.location || 'N/A'} <ChevronRight className="h-3 w-3 ml-0.5" /></Link>
          </Badge>
        </div>
        <CardDescription className="text-xs">ID: {device.id}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-3">
          {SENSOR_ORDER_AND_DETAILS.map(({ key, legacyId }) => {
            const readingValue = device.readings?.[key];
            const IconComponent = getLucideIcon(SENSOR_ICON_NAMES[legacyId]);
            const bgColor = getSensorBackgroundColor(legacyId);
            const unit = getUnit(key);
            
            return (
              <div key={key} className={`p-3 rounded-lg ${bgColor} space-y-1 shadow-sm`}>
                <div className="flex items-center justify-between text-xs font-medium text-foreground/80">
                  <span>{SENSOR_DISPLAY_NAMES[legacyId] || 'N/A'}</span>
                  {IconComponent && <IconComponent className="h-4 w-4 text-foreground/70" />}
                </div>
                <div className="text-xl font-bold text-foreground">
                  {readingValue !== undefined ? `${readingValue}${unit}` : 'N/A'}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1.5 text-muted-foreground">Container Levels</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium">Water</span>
                <span className="text-muted-foreground">{device.readings?.waterLevel ?? 0}%</span>
              </div>
              <Progress value={device.readings?.waterLevel ?? 0} className="h-2 [&>div]:bg-[hsl(var(--progress-water))]" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium">Fertilizer</span>
                <span className="text-muted-foreground">{device.readings?.fertilizerLevel ?? 0}%</span>
              </div>
              <Progress value={device.readings?.fertilizerLevel ?? 0} className="h-2 [&>div]:bg-[hsl(var(--progress-fertilizer))]" />
            </div>
          </div>
        </div>
        
      </CardContent>
      <CardFooter className="p-3 bg-muted/20 border-t mt-auto">
        <Link href={`/devices/${device.key}`} className="text-xs text-primary hover:underline flex items-center w-full justify-center">
          Click for detailed analytics
          <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
