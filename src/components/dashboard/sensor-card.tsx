import Link from 'next/link';
import type { SensorReading } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SensorCardProps {
  sensor: SensorReading;
  deviceId: string;
}

export function SensorCard({ sensor, deviceId }: SensorCardProps) {
  const SensorIcon = sensor.icon;
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{sensor.name}</CardTitle>
        <SensorIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {sensor.value}
          <span className="text-xl text-muted-foreground">{sensor.unit}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {sensor.lastUpdated}
        </p>
        <Button variant="link" asChild className="p-0 mt-2 text-sm h-auto">
          <Link href={`/devices/${deviceId}/history/${sensor.id}`}>
            View History <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
