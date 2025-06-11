
"use client";

import type { DeviceHistoryEntry } from '@/lib/firebase/types';
import type { ChartConfig } from "@/components/ui/chart";
import { SENSOR_DISPLAY_NAMES, SENSOR_ICON_NAMES, getLucideIcon } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, TooltipProps } from "recharts";
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatInTimeZone } from 'date-fns-tz';

interface TemperatureHistoryDataPoint {
  date: string; // ISO string or formatted for chart
  soil_temperature: number | null;
  air_temperature: number | null;
}

interface TemperatureHistoryChartProps {
  fullHistoryData: DeviceHistoryEntry[];
  title: string;
  deviceId: string; // Keep deviceId if needed for other purposes, though data comes from fullHistoryData
}

const ChartIcon = getLucideIcon('BarChart3');
const TIMEZONE = 'Asia/Manila';

export function TemperatureHistoryChart({ fullHistoryData, title, deviceId }: TemperatureHistoryChartProps) {
  const chartData: TemperatureHistoryDataPoint[] = fullHistoryData
    .map(entry => ({
      date: entry.timestamp,
      soil_temperature: entry.soilTemperature ?? null,
      air_temperature: entry.airTemperature ?? null,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartConfig = {
    soil_temperature: {
      label: SENSOR_DISPLAY_NAMES['soil_temperature'],
      color: "hsl(var(--chart-4))", 
      icon: getLucideIcon(SENSOR_ICON_NAMES['soil_temperature']) || undefined,
    },
    air_temperature: {
      label: SENSOR_DISPLAY_NAMES['air_temperature'],
      color: "hsl(var(--chart-2))", 
      icon: getLucideIcon(SENSOR_ICON_NAMES['air_temperature']) || undefined,
    },
  } satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            {ChartIcon && <ChartIcon className="mr-2 h-5 w-5 text-primary" />}
            {title}
          </CardTitle>
          <CardDescription>No historical temperature data available for this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Data will appear here once recorded.</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = formatInTimeZone(date, TIMEZONE, "MMM d, h:mm a");
      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-sm">
          <p className="text-sm font-medium text-foreground mb-1.5">{formattedDate}</p>
          {payload.map((pld) => (
            <div key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
              {pld.value !== null ? `${pld.name}: ${pld.value}°C` : `${pld.name}: N/A`}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
           {ChartIcon && <ChartIcon className="mr-2 h-5 w-5 text-primary" />}
           {title}
        </CardTitle>
        <CardDescription>Historical soil and air temperature readings (°C).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
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
                tickFormatter={(value) => `${value}°C`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 'auto']} // Adjusted domain
                allowDataOverflow={true}
              />
              <ChartTooltip
                cursor={true}
                content={<CustomTooltip />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="soil_temperature"
                type="monotone"
                stroke="var(--color-soil_temperature)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-soil_temperature)" }}
                activeDot={{ r: 5 }}
                name={SENSOR_DISPLAY_NAMES['soil_temperature']}
                connectNulls // Important for lines with null values
              />
              <Line
                dataKey="air_temperature"
                type="monotone"
                stroke="var(--color-air_temperature)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-air_temperature)" }}
                activeDot={{ r: 5 }}
                name={SENSOR_DISPLAY_NAMES['air_temperature']}
                connectNulls // Important for lines with null values
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
