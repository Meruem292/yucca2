
"use client"; 

import Link from 'next/link';
import type { SensorType, SensorIconNameType } from '@/lib/constants'; // Updated types
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getLucideIcon, SENSOR_ICON_NAMES } from '@/lib/constants'; 

interface SensorCardProps {
  sensorId: SensorType; // e.g., 'soil_moisture', 'air_temperature'
  name: string;
  value: string | number;
  unit: string;
  iconName: keyof typeof SENSOR_ICON_NAMES; // String name of the icon
  lastUpdated?: string;
  deviceId: string; // Firebase key of the device
}

export function SensorCard({ sensorId, name, value, unit, iconName, lastUpdated, deviceId }: SensorCardProps) {
  const IconComponent = getLucideIcon(iconName);

  // Determine if history link is applicable (e.g., not for general 'waterLevel' if it's just a percentage)
  // For now, link all mapped sensors.
  const canViewHistory = ['soil_moisture', 'soil_temperature', 'air_temperature', 'air_humidity'].includes(sensorId);
  // The history page uses 'temperature' as a combined view for soil & air temp.
  const historySensorType = sensorId === 'soil_temperature' || sensorId === 'air_temperature' ? 'temperature' : sensorId;


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {value}
          <span className="text-xl text-muted-foreground">{unit}</span>
        </div>
        {lastUpdated && (
            <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated}
            </p>
        )}
        {canViewHistory && (
          <Button variant="link" asChild className="p-0 mt-2 text-sm h-auto">
            <Link href={`/devices/${deviceId}/history/${historySensorType}`}>
              View History <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
