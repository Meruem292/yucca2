
"use client";

import type { DeviceHistoryEntry, DeviceSensorReadings } from '@/lib/firebase/types';
import type { ChartConfig } from "@/components/ui/chart";
import { SENSOR_DISPLAY_NAMES, SENSOR_ICON_NAMES, getLucideIcon, type SensorType } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { formatInTimeZone } from 'date-fns-tz';

interface SensorHistoryDataPoint {
  date: string; // Formatted for chart
  value: number;
}
interface SensorHistoryChartProps {
  fullHistoryData: DeviceHistoryEntry[];
  dataKeyToPlot: keyof Pick<DeviceSensorReadings, 'soilMoisture' | 'airHumidity' | 'waterLevel' | 'fertilizerLevel'>; // Restrict to plottable numeric sensor keys
  unit: string;
  title: string;
  iconName: keyof typeof SENSOR_ICON_NAMES;
}

const TIMEZONE = 'Asia/Manila';

export function SensorHistoryChart({ fullHistoryData, dataKeyToPlot, unit, title, iconName }: SensorHistoryChartProps) {
  const SensorIcon = getLucideIcon(iconName);

  const chartData: SensorHistoryDataPoint[] = fullHistoryData
    .map(entry => ({
      date: entry.timestamp, // Already ISO string from Firebase
      value: entry[dataKeyToPlot] as number, // Asserting it's a number based on dataKeyToPlot
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartColorKey = dataKeyToPlot === 'soilMoisture' ? 'soil_moisture' :
                        dataKeyToPlot === 'airHumidity' ? 'air_humidity' :
                        'default_sensor'; // Fallback key for color

  const chartColor = chartColorKey === 'soil_moisture' ? 'hsl(var(--chart-1))' : 
                     chartColorKey === 'air_humidity' ? 'hsl(var(--chart-3))' :
                     'hsl(var(--chart-5))'; // Default color

  const chartConfig = {
    value: {
      label: SENSOR_DISPLAY_NAMES[dataKeyToPlot as SensorType] || "Sensor Value", // Cast for display name lookup
      color: chartColor,
      icon: SensorIcon || undefined,
    },
  } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            {SensorIcon && <SensorIcon className="mr-2 h-5 w-5 text-primary" />}
            {title}
          </CardTitle>
          <CardDescription>No historical data available for this sensor.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Data will appear here once recorded.</p>
        </CardContent>
      </Card>
    );
  }
  
  const yAxisDomain: [number | string, number | string] = ['auto', 'auto'];
  if (unit === '%') {
     yAxisDomain[0] = 0;
     yAxisDomain[1] = 100;
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
           {SensorIcon && <SensorIcon className="mr-2 h-5 w-5 text-[hsl(var(--chart-3))]" />} {/* Updated icon color */}
           {title}
        </CardTitle>
        <CardDescription>Last 30 days of {SENSOR_DISPLAY_NAMES[dataKeyToPlot as SensorType]?.toLowerCase() || 'sensor'} readings ({unit}).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatInTimeZone(new Date(value), TIMEZONE, "MMM d, h:mm a")}
                minTickGap={30}
              />
              <YAxis
                tickFormatter={(value) => `${value}${unit}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={yAxisDomain}
                allowDataOverflow={true}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" labelFormatter={(value, payload) => {
                   if (payload && payload.length > 0 && payload[0].payload.date) {
                     return formatInTimeZone(new Date(payload[0].payload.date), TIMEZONE, "eeee, MMMM d, yyyy h:mm a");
                   }
                   return "";
                }}/>}
              />
              <defs>
                <linearGradient id={`fill-${dataKeyToPlot}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                dataKey="value"
                type="natural"
                fill={`url(#fill-${dataKeyToPlot})`}
                stroke={chartColor}
                stackId="a"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
