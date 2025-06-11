
"use client";

import type { DeviceHistoryEntry } from '@/lib/firebase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLucideIcon } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatInTimeZone } from 'date-fns-tz';

interface RecentReadingsTableProps {
  deviceHistory: DeviceHistoryEntry[];
  deviceId: string; // Keep for context if needed, though data comes from deviceHistory
}

const ClockIcon = getLucideIcon('Clock');
const TIMEZONE = 'Asia/Manila';

export function RecentReadingsTable({ deviceHistory, deviceId }: RecentReadingsTableProps) {
  // Get the last 6 entries, assuming history is sorted newest to oldest by Firebase key (timestamp)
  // Or sort it if not guaranteed. For now, assuming serverTimestamp keys are sortable.
  const recentReadings = deviceHistory
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const formatValue = (value: number | undefined | null, unit: string = '') => {
    if (value === null || value === undefined) return <span className="text-muted-foreground">N/A</span>;
    return `${value}${unit}`;
  };

  return (
    <Card className="shadow-lg rounded-xl mt-8">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          {ClockIcon && <ClockIcon className="mr-2 h-5 w-5 text-primary" />}
          Recent Readings
        </CardTitle>
        <CardDescription>Last few sensor readings for this device.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentReadings.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent readings available.</p>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Time</TableHead>
                  <TableHead className="text-center">Soil Moisture</TableHead>
                  <TableHead className="text-center">Soil Temp</TableHead>
                  <TableHead className="text-center">Air Temp</TableHead>
                  <TableHead className="text-center">Air Humidity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReadings.map((reading) => (
                  <TableRow key={reading.timestamp}>
                    <TableCell className="font-medium text-xs">
                      {formatInTimeZone(new Date(reading.timestamp), TIMEZONE, "MMM d, h:mm:ss a")}
                    </TableCell>
                    <TableCell className="text-center">{formatValue(reading.soilMoisture, '%')}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.soilTemperature, '°C')}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.airTemperature, '°C')}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.airHumidity, '%')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
