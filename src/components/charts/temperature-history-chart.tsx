
"use client";

import type { TemperatureHistoryDataPoint } from '@/lib/mock-data';
import { getMockTemperatureHistory } from '@/lib/mock-data';
import type { ChartConfig } from "@/components/ui/chart";
import { SENSOR_DISPLAY_NAMES, getLucideIcon } from '@/lib/constants';
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
import { format } from 'date-fns';

interface TemperatureHistoryChartProps {
  deviceId: string;
}

const ChartIcon = getLucideIcon('BarChart3'); // Or 'Thermometer'

export function TemperatureHistoryChart({ deviceId }: TemperatureHistoryChartProps) {
  // In a real app, you might fetch this data
  const historyData = getMockTemperatureHistory(deviceId);

  const chartConfig = {
    soil_temperature: {
      label: SENSOR_DISPLAY_NAMES['soil_temperature'],
      color: "hsl(var(--chart-4))", // Reddish
      icon: getLucideIcon(SENSOR_ICON_NAMES['soil_temperature']) || undefined,
    },
    air_temperature: {
      label: SENSOR_DISPLAY_NAMES['air_temperature'],
      color: "hsl(var(--chart-2))", // Orange/Yellow
      icon: getLucideIcon(SENSOR_ICON_NAMES['air_temperature']) || undefined,
    },
  } satisfies ChartConfig;

  if (historyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {ChartIcon && <ChartIcon className="mr-2 h-6 w-6 text-muted-foreground" />}
            Temperature History
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
      const formattedDate = format(date, "MMM d, h:mm a");
      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-sm">
          <p className="text-sm font-medium text-foreground mb-1.5">{formattedDate}</p>
          {payload.map((pld) => (
            <div key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${pld.value}°C`}
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
           Temperature History
        </CardTitle>
        <CardDescription>Historical soil and air temperature readings (°C).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(new Date(value), "MMM d, h:mm a")}
                minTickGap={30} // Adjust to prevent overcrowding
              />
              <YAxis
                tickFormatter={(value) => `${value}°C`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 30]} // As per image
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
              />
              <Line
                dataKey="air_temperature"
                type="monotone"
                stroke="var(--color-air_temperature)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-air_temperature)" }}
                activeDot={{ r: 5 }}
                name={SENSOR_DISPLAY_NAMES['air_temperature']}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
