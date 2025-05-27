
"use client";

import type { RecentReadingRow } from '@/lib/mock-data';
import { getMockRecentReadings } from '@/lib/mock-data';
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

interface RecentReadingsTableProps {
  deviceId: string;
}

const ClockIcon = getLucideIcon('Clock');

export function RecentReadingsTable({ deviceId }: RecentReadingsTableProps) {
  const recentReadings = getMockRecentReadings(deviceId);

  const formatValue = (value: string | null) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground">N/A</span>;
    
    // Basic color styling based on image (blue for moisture, red for temp potentially if out of range)
    // This is a simplified version. Real thresholds would be needed.
    if (value.includes('%')) {
        const numVal = parseInt(value);
        if (numVal < 30) return <span className="text-destructive">{value}</span>; // Example for low moisture
        return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    }
     if (value.includes('°C')) {
        const numVal = parseFloat(value);
        if (numVal < 10 || numVal > 30) return <span className="text-destructive">{value}</span>; // Example for out of range temp
    }
    return value;
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
          <ScrollArea className="h-[300px] w-full"> {/* Makes table scrollable if content overflows */}
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
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium text-xs">{reading.time}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.soil_moisture)}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.soil_temperature)}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.air_temperature)}</TableCell>
                    <TableCell className="text-center">{formatValue(reading.air_humidity)}</TableCell>
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
