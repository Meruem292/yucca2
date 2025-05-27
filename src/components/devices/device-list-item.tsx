
"use client";
import Link from 'next/link';
import type { Device } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { getLucideIcon } from '@/lib/constants';

export function DeviceListItem({ device }: { device: Device }) {
  const previewSensors = device.sensors.slice(0, 3);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{device.name}</CardTitle>
            <CardDescription>ID: {device.uniqueId}</CardDescription>
          </div>
          <Badge variant={device.isConnected ? 'default' : 'destructive'} className={device.isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
            {device.isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">Key Sensor Readings:</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {previewSensors.map(sensor => {
            const Icon = getLucideIcon(sensor.iconName);
            return (
              <div key={sensor.id} className="flex items-center space-x-1 p-2 bg-muted rounded-md">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                <span>{sensor.value}{sensor.unit}</span>
              </div>
            );
          })}
           {device.sensors.length > 3 && <div className="flex items-center justify-center p-2 bg-muted rounded-md text-muted-foreground">...</div>}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/devices/${device.id}`}>
            Manage Device <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
