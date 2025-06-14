
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react'; // Changed icon for more generic "levels"

interface OverallLevelsChartProps {
  waterLevel: number;
  fertilizerLevel: number;
  isLoading?: boolean;
}

export function OverallLevelsChart({ waterLevel, fertilizerLevel, isLoading }: OverallLevelsChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[250px] w-full rounded-lg" />;
  }

  const data = [
    { name: 'Water', value: waterLevel, fill: 'hsl(var(--progress-water))' },
    { name: 'Fertilizer', value: fertilizerLevel, fill: 'hsl(var(--progress-fertilizer))' },
  ];

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Overall Nutrient Levels
        </CardTitle>
        <CardDescription>Average levels across your active devices.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(0)}%`, undefined]} 
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="value" barSize={25} radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
