
import { getMockDeviceById, mockDevices } from '@/lib/mock-data'; // Added mockDevices import
import type { Device } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { SensorCard } from '@/components/dashboard/sensor-card';
import { ConfigureDeviceForm } from '@/components/devices/configure-device-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface DeviceDetailPageProps {
  params: { deviceId: string };
}

export default async function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  // Fetch device data based on params.deviceId
  const device = getMockDeviceById(params.deviceId);

  if (!device) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/devices">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Devices
        </Link>
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-3xl font-bold">{device.name}</CardTitle>
              <CardDescription className="text-md">Unique ID: {device.uniqueId}</CardDescription>
            </div>
            <Badge
              variant={device.isConnected ? 'default' : 'destructive'}
              className={`mt-2 sm:mt-0 px-3 py-1 text-sm ${device.isConnected ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}
            >
              {device.isConnected ? 'Connected & Online' : 'Offline'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Sensor Readings</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {device.sensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} deviceId={device.id} />
              ))}
            </div>
          </section>

          <section>
            <ConfigureDeviceForm device={device} />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateStaticParams() {
  // In a real app, fetch all device IDs to pre-render pages
  const devices = mockDevices;
  return devices.map((device) => ({
    deviceId: device.id,
  }));
}
