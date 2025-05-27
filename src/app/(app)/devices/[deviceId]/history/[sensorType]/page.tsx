
import { getMockDeviceById, mockDevices } from '@/lib/mock-data';
import type { SensorType } from '@/lib/constants';
import { SENSOR_DISPLAY_NAMES, HISTORY_SENSOR_TYPES, getLucideIcon } from '@/lib/constants';
import { notFound, useRouter } from 'next/navigation';
import { SensorHistoryChart } from '@/components/charts/sensor-history-chart';
import { TemperatureHistoryChart } from '@/components/charts/temperature-history-chart';
import { RecentReadingsTable } from '@/components/devices/recent-readings-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from 'lucide-react';

interface SensorHistoryPageProps {
  params: {
    deviceId: string;
    sensorType: SensorType; // This will be the initially active tab
  };
}

export default async function SensorHistoryPage({ params }: SensorHistoryPageProps) {
  const device = getMockDeviceById(params.deviceId);

  if (!device) {
    notFound();
  }

  const initialSensorType = params.sensorType;
  const isValidSensorTypeForTabs = HISTORY_SENSOR_TYPES.some(tab => tab.id === initialSensorType);

  if (!isValidSensorTypeForTabs) {
      // Default to 'temperature' or first available if initialSensorType is invalid for tabs
      // Or redirect to a valid one. For now, let's consider it a near-notFound for simplicity
      // as this page is designed around these specific tab views.
      console.warn(`Invalid sensorType '${initialSensorType}' for history page. Defaulting or erroring.`);
      // For a production app, redirect to /devices/[deviceId]/history/temperature or handle gracefully.
      // For now, let it proceed and Tabs will default to its first child.
  }
  
  const getPageTitle = (activeTab: SensorType) => {
    const displayName = SENSOR_DISPLAY_NAMES[activeTab] || "Sensor";
    return `${displayName} History for ${device.name}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <Button variant="outline" asChild className="mb-2 sm:mb-0">
                <Link href={`/devices/${params.deviceId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {device.name}
                </Link>
            </Button>
            {/* Page title will now be part of each chart card */}
        </div>
      </div>

      <Tabs defaultValue={initialSensorType} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
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
            sensorType="soil_moisture"
            historyData={getMockDeviceById(params.deviceId)?.sensors.find(s => s.id === 'soil_moisture') ? getMockSensorHistory(params.deviceId, 'soil_moisture') : []}
            unit="%"
            title={`${SENSOR_DISPLAY_NAMES['soil_moisture']} History for ${device.name}`}
            iconName="Droplets"
          />
        </TabsContent>
        <TabsContent value="temperature">
          <TemperatureHistoryChart deviceId={params.deviceId} />
        </TabsContent>
        <TabsContent value="air_humidity">
          <SensorHistoryChart
            sensorType="air_humidity"
            historyData={getMockDeviceById(params.deviceId)?.sensors.find(s => s.id === 'air_humidity') ? getMockSensorHistory(params.deviceId, 'air_humidity') : []}
            unit="%"
            title={`${SENSOR_DISPLAY_NAMES['air_humidity']} History for ${device.name}`}
            iconName="CloudRain"
          />
        </TabsContent>
      </Tabs>

      <RecentReadingsTable deviceId={params.deviceId} />
    </div>
  );
}

export async function generateStaticParams() {
  const params: { deviceId: string; sensorType: string }[] = [];
  mockDevices.forEach(device => {
    HISTORY_SENSOR_TYPES.forEach(tabType => {
      params.push({ deviceId: device.id, sensorType: tabType.id });
    });
  });
  return params;
}
