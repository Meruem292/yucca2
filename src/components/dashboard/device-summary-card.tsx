
"use client";
import type { Device, SensorReading, SensorHistoryDataPoint } from '@/lib/mock-data';
import { SENSOR_DISPLAY_NAMES, type SensorType, getLucideIcon, SENSOR_ICON_NAMES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Smartphone, ChevronRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getMockSensorHistory } from '@/lib/mock-data';
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";

interface DeviceSummaryCardProps {
  device: Device;
}

const getSensorBackgroundColor = (sensorId: SensorType): string => {
  switch (sensorId) {
    case 'soil_moisture': return 'bg-[hsl(var(--sensor-soil-moisture-bg))]';
    case 'soil_temperature': return 'bg-[hsl(var(--sensor-soil-temperature-bg))]';
    case 'air_temperature': return 'bg-[hsl(var(--sensor-air-temperature-bg))]';
    case 'air_humidity': return 'bg-[hsl(var(--sensor-air-humidity-bg))]';
    default: return 'bg-muted/30';
  }
};

export function DeviceSummaryCard({ device }: DeviceSummaryCardProps) {
  const getSensorReading = (sensorId: SensorType): SensorReading | undefined => {
    return device.sensors.find(s => s.id === sensorId);
  };

  const sensorIds: SensorType[] = ['soil_moisture', 'soil_temperature', 'air_temperature', 'air_humidity'];

  const soilMoistureHistory: SensorHistoryDataPoint[] = getMockSensorHistory(device.id, 'soil_moisture');

  const chartConfig = {
    soilMoisture: {
      label: "Soil Moisture", // Not displayed in this mini chart, but good for config
      color: "hsl(var(--chart-3))", // Muted Blue from globals.css
    },
  } satisfies ChartConfig;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
      <CardHeader className="p-4 bg-muted/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{device.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs" asChild>
            <Link href={`/devices/${device.id}`}>{device.location} <ChevronRight className="h-3 w-3 ml-0.5" /></Link>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {sensorIds.map((id) => {
            const sensor = getSensorReading(id);
            const IconComponent = sensor ? getLucideIcon(sensor.iconName) : getLucideIcon(SENSOR_ICON_NAMES[id]);
            const bgColor = getSensorBackgroundColor(id);
            return (
              <div key={id} className={`p-3 rounded-lg ${bgColor} space-y-1 shadow-sm`}>
                <div className="flex items-center justify-between text-xs font-medium text-foreground/80">
                  <span>{sensor ? SENSOR_DISPLAY_NAMES[id] : 'N/A'}</span>
                  {IconComponent && <IconComponent className="h-4 w-4 text-foreground/70" />}
                </div>
                <div className="text-xl font-bold text-foreground">
                  {sensor ? `${sensor.value}${sensor.unit}` : 'N/A'}
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
                <span className="text-muted-foreground">{device.levels.water}%</span>
              </div>
              <Progress value={device.levels.water} className="h-2 [&>div]:bg-[hsl(var(--progress-water))]" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-medium">Fertilizer</span>
                <span className="text-muted-foreground">{device.levels.fertilizer}%</span>
              </div>
              <Progress value={device.levels.fertilizer} className="h-2 [&>div]:bg-[hsl(var(--progress-fertilizer))]" />
            </div>
          </div>
        </div>
        
        <div>
            <h4 className="text-sm font-medium mb-1.5 text-muted-foreground">Historical Trends (30d)</h4>
            <div className="h-[60px] rounded-lg bg-muted/30 p-1">
              {soilMoistureHistory.length > 0 ? (
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={soilMoistureHistory} 
                      margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                      barCategoryGap="20%"
                    >
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Bar dataKey="value" fill="var(--color-soilMoisture)" radius={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground">No trend data available</p>
                </div>
              )}
            </div>
        </div>

      </CardContent>
      <CardFooter className="p-3 bg-muted/20 border-t">
        <Link href={`/devices/${device.id}`} className="text-xs text-primary hover:underline flex items-center w-full justify-center">
          Click for detailed analytics
          <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
