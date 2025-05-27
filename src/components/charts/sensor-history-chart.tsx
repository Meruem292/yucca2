
"use client";

import type { SensorHistoryDataPoint } from '@/lib/mock-data';
import type { ChartConfig } from "@/components/ui/chart";
import { SENSOR_DISPLAY_NAMES, SENSOR_ICON_NAMES, getLucideIcon, type SensorType } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format } from 'date-fns';

interface SensorHistoryChartProps {
  sensorType: SensorType;
  historyData: SensorHistoryDataPoint[];
  unit: string;
  title: string; // Added title prop
  iconName: keyof typeof SENSOR_ICON_NAMES; // Added iconName prop
}

export function SensorHistoryChart({ sensorType, historyData, unit, title, iconName }: SensorHistoryChartProps) {
  const SensorIcon = getLucideIcon(SENSOR_ICON_NAMES[iconName] || iconName); // Use iconName for lookup

  const chartColor = sensorType === 'soil_moisture' ? 'hsl(var(--chart-1))' : 
                     sensorType === 'air_humidity' ? 'hsl(var(--chart-3))' : // Example: blue for humidity
                     'hsl(var(--chart-5))'; // Default color

  const chartConfig = {
    value: {
      label: SENSOR_DISPLAY_NAMES[sensorType] || "Sensor",
      color: chartColor,
      icon: SensorIcon || undefined,
    },
  } satisfies ChartConfig;

  if (historyData.length === 0) {
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
           {SensorIcon && <SensorIcon className="mr-2 h-5 w-5 text-primary" />}
           {title}
        </CardTitle>
        <CardDescription>Last 30 days of {SENSOR_DISPLAY_NAMES[sensorType]?.toLowerCase()} readings ({unit}).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(new Date(value), "MMM d, h:mm a")}
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
                     return format(new Date(payload[0].payload.date), "eeee, MMMM d, yyyy h:mm a");
                   }
                   return "";
                }}/>}
              />
              <defs>
                <linearGradient id={`fill-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                dataKey="value"
                type="natural"
                fill={`url(#fill-${sensorType})`}
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
