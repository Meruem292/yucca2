import { getMockDeviceById, getMockSensorHistory } from '@/lib/mock-data';
import type { SensorType } from '@/lib/constants';
import { SENSOR_DISPLAY_NAMES } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { SensorHistoryChart } from '@/components/charts/sensor-history-chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SensorHistoryPageProps {
  params: {
    deviceId: string;
    sensorType: string; 
  };
}

export default async function SensorHistoryPage({ params }: SensorHistoryPageProps) {
  const device = getMockDeviceById(params.deviceId);
  const sensorType = params.sensorType as SensorType; // Assume sensorType from URL is valid

  if (!device || !(sensorType in SENSOR_DISPLAY_NAMES)) {
    notFound();
  }

  const sensor = device.sensors.find(s => s.id === sensorType);
  if (!sensor) {
    notFound();
  }

  const historyData = getMockSensorHistory(params.deviceId, sensorType);
  const sensorName = SENSOR_DISPLAY_NAMES[sensorType] || "Sensor";

  return (
    <div className="space-y-8">
      <Button variant="outline" asChild className="mb-4">
        <Link href={`/devices/${params.deviceId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {device.name}
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{sensorName} History for {device.name}</h1>
        <p className="text-muted-foreground">
          View historical data trends for the {sensorName.toLowerCase()} sensor.
        </p>
      </div>
      <SensorHistoryChart sensorType={sensorType} historyData={historyData} unit={sensor.unit} />
    </div>
  );
}

export async function generateStaticParams() {
  // In a real app, fetch all device IDs and their sensor types
  const params: { deviceId: string; sensorType: string }[] = [];
  mockDevices.forEach(device => {
    device.sensors.forEach(sensor => {
      params.push({ deviceId: device.id, sensorType: sensor.id });
    });
  });
  return params;
}
