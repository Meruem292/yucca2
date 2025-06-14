
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
  description?: string;
  descriptionClassName?: string;
  isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, valueClassName, description, descriptionClassName, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-1" />
          {description && <Skeleton className="h-4 w-1/4" />}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ease-in-out rounded-lg">
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

