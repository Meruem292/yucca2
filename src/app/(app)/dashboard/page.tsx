
import { mockDevices } from '@/lib/mock-data';
import { DeviceSummaryCard } from '@/components/dashboard/device-summary-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default async function DashboardPage() {
  const devices = mockDevices; // In a real app, fetch this data

  // Example data for "Plants Needing Attention" - can be dynamic
  const plantsHealthy = true; 

  return (
    <div className="space-y-8">
      {/* Dashboard Banner */}
      <div className="rounded-lg bg-[hsl(var(--dashboard-banner-background))] p-6 shadow">
        <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-[hsl(var(--dashboard-banner-title-foreground))]" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--dashboard-banner-title-foreground))]">Dashboard</h1>
                <p className="text-[hsl(var(--dashboard-banner-foreground))]">
                Monitor your plant care system
                </p>
            </div>
        </div>
      </div>

      {/* Device Analytics Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Device Analytics</h2>
        </div>
        {devices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <DeviceSummaryCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-10">
            <CardContent>
              <p className="text-muted-foreground">No devices registered yet.</p>
              {/* Optionally add a button to register a device */}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity Section - (Plants needing attention moved here) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent Activity / Alerts</h2>
        </div>
        <Card className="shadow-sm rounded-lg">
            <CardHeader className="flex flex-row items-center space-x-3 rounded-t-lg bg-[hsl(var(--attention-header-background))] p-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--attention-header-foreground))]" />
            <CardTitle className="text-md font-semibold text-[hsl(var(--attention-header-foreground))]">
                Plants Needing Attention
            </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 text-center">
            {plantsHealthy ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-2" />
                <p className="text-lg sm:text-xl font-semibold text-card-foreground">All Plants Are Healthy</p>
                <p className="text-sm text-muted-foreground">No actions required at this time.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-2" />
                <p className="text-lg sm:text-xl font-semibold text-destructive">Some plants need attention!</p>
                <p className="text-sm text-muted-foreground">Check device details for more information.</p>
                </div>
            )}
            {/* Placeholder for other recent activities */}
            {/* <p className="text-xs text-muted-foreground mt-4">No other recent activity.</p> */}
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
