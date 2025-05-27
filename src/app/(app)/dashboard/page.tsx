import Link from 'next/link';
import { mockDevices } from '@/lib/mock-data';
import type { Device } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { SensorCard } from '@/components/dashboard/sensor-card';

export default function DashboardPage() {
  const devices = mockDevices; // In a real app, fetch this data

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Realtime overview of your connected Yucca devices.
          </p>
        </div>
        <Button asChild>
          <Link href="/devices/register">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Device
          </Link>
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl">No Devices Yet</CardTitle>
            <CardDescription>
              Start by registering your first Yucca device to monitor your plants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img src="https://placehold.co/300x200.png" alt="No devices illustration" data-ai-hint="empty state plant" className="mx-auto mb-6 rounded-lg shadow-md" />
          </CardContent>
           <CardFooter className="justify-center">
             <Button asChild size="lg">
              <Link href="/devices/register">
                <PlusCircle className="mr-2 h-5 w-5" />
                Register a Device
              </Link>
            </Button>
           </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          {devices.map((device: Device) => (
            <Card key={device.id} className="shadow-lg">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{device.name}</CardTitle>
                  <CardDescription>ID: {device.uniqueId}</CardDescription>
                </div>
                <Badge variant={device.isConnected ? 'default' : 'destructive'} className="bg-primary_foreground">
                  {device.isConnected ? 'Connected' : 'Offline'}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {device.sensors.slice(0,3).map(sensor => ( // Show first 3 sensors as example
                    <SensorCard key={sensor.id} sensor={sensor} deviceId={device.id} />
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href={`/devices/${device.id}`}>
                    View Full Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
