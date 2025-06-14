
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardAlert } from '@/lib/firebase/types';
import { AlertTriangle, Droplets, PackageSearch } from 'lucide-react';

interface AlertSummaryChartProps {
  alerts: DashboardAlert[];
  isLoading?: boolean;
}

const ALERT_TYPE_DETAILS: Record<'low_water' | 'low_fertilizer', { name: string; color: string; icon: React.ElementType }> = {
  low_water: { name: 'Low Water', color: 'hsl(var(--chart-1))', icon: Droplets },
  low_fertilizer: { name: 'Low Fertilizer', color: 'hsl(var(--chart-2))', icon: PackageSearch },
};

export function AlertSummaryChart({ alerts, isLoading }: AlertSummaryChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[250px] w-full rounded-lg" />;
  }

  const criticalAlerts = alerts.filter(alert => alert.type === 'low_water' || alert.type === 'low_fertilizer');

  const alertCounts = criticalAlerts.reduce((acc, alert) => {
    if (alert.type === 'low_water' || alert.type === 'low_fertilizer') {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<'low_water' | 'low_fertilizer', number>);

  const chartData = (Object.keys(alertCounts) as Array<'low_water' | 'low_fertilizer'>)
    .map(key => ({
      id: key, // for legend key
      name: ALERT_TYPE_DETAILS[key].name,
      value: alertCounts[key],
      fill: ALERT_TYPE_DETAILS[key].color,
      icon: ALERT_TYPE_DETAILS[key].icon,
    }))
    .filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Alert Summary
          </CardTitle>
          <CardDescription>Overview of current critical alerts.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[178px]">
          <p className="text-muted-foreground">No critical alerts to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Alert Summary
        </CardTitle>
        <CardDescription>Overview of current critical alerts.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={65}
              innerRadius={45}
              fill="#8884d8"
              dataKey="value"
              stroke="hsl(var(--background))" // Add a border to segments
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [`${value} ${name.toLowerCase().includes('water') || name.toLowerCase().includes('fertilizer') ? 'alerts' : ''}`, name]}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}
            />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ paddingLeft: '10px' }}
              formatter={(value, entry: any) => { // entry is any due to recharts type
                const item = chartData.find(d => d.name === value);
                const Icon = item?.icon;
                return (
                  <span className="flex items-center gap-1.5 text-xs">
                    {Icon && <Icon className="h-3 w-3" style={{ color: item?.fill }} />}
                    {value} ({item?.value})
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
