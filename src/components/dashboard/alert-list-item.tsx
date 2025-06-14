
"use client";

import type { DashboardAlert } from '@/lib/firebase/types';
import { AlertTriangle, Droplets, PackageSearch, Zap, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AlertListItemProps {
  alert: DashboardAlert;
}

export function AlertListItem({ alert }: AlertListItemProps) {
  const Icon =
    alert.type === 'low_water' ? Droplets :
    alert.type === 'low_fertilizer' ? PackageSearch :
    (alert.type === 'pump_active_water' || alert.type === 'pump_active_fertilizer') ? Zap :
    Info; // Default icon

  const iconColor = 
    alert.severity === 'warning' ? 'text-destructive' : 
    alert.severity === 'info' ? 'text-blue-500' : // Using a distinct color for info
    'text-muted-foreground';


  return (
    <div className="flex items-start space-x-3 py-3 px-4 hover:bg-muted/30 transition-colors">
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor)} />
      <div className="flex-1 min-w-0"> {/* Added min-w-0 for better truncation if needed */}
        <p className="text-sm font-medium text-card-foreground truncate">
          <span className="font-semibold">{alert.deviceName}:</span> {alert.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
