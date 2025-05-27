import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
  description?: string;
  descriptionClassName?: string;
}

export function StatCard({ title, value, icon: Icon, valueClassName, description, descriptionClassName }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold text-card-foreground", valueClassName)}>
          {value}
          {description && (
            <span className={cn("ml-1 text-xs font-normal", descriptionClassName)}>
              {description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
