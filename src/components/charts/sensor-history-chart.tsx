
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

interface SensorHistoryChartProps {
  sensorType: SensorType;
  historyData: SensorHistoryDataPoint[];
  unit: string;
}

export function SensorHistoryChart({ sensorType, historyData, unit }: SensorHistoryChartProps) {
  const sensorName = SENSOR_DISPLAY_NAMES[sensorType] || "Sensor";
  const iconName = SENSOR_ICON_NAMES[sensorType];
  const SensorIcon = getLucideIcon(iconName);

  const chartConfig = {
    value: {
      label: sensorName,
      color: "hsl(var(--chart-3))", // Changed to chart-3 for blue
      icon: SensorIcon || undefined,
    },
  } satisfies ChartConfig;

  if (historyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {SensorIcon && <SensorIcon className="mr-2 h-6 w-6 text-[hsl(var(--chart-3))]" />} {/* Changed icon color */}
            {sensorName} History
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
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
           {SensorIcon && <SensorIcon className="mr-3 h-7 w-7 text-[hsl(var(--chart-3))]" />} {/* Changed icon color */}
          {sensorName} History
        </CardTitle>
        <CardDescription>Last 30 days of {sensorName.toLowerCase()} readings ({unit}).</CardDescription>
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
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
              <YAxis 
                tickFormatter={(value) => `${value}${unit}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={yAxisDomain}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" labelFormatter={(_, payload) => {
                   if (payload && payload.length > 0 && payload[0].payload.date) {
                     return new Date(payload[0].payload.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                   }
                   return "";
                }}/>}
              />
              <defs>
                <linearGradient id={`fill-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/> {/* Changed to chart-3 */}
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/> {/* Changed to chart-3 */}
                </linearGradient>
              </defs>
              <Area
                dataKey="value"
                type="natural"
                fill={`url(#fill-${sensorType})`}
                stroke="hsl(var(--chart-3))" // Changed to chart-3
                stackId="a"
                dot={false}
              />
               {/* Removed ChartLegend */}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

