import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Settings2, Droplets, PackageSearch, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  // Mock data for the new dashboard
  const activePlants = 2;
  const activeSensors = 2;
  const waterLevel = { value: "14%", status: "(Low!)", isLow: true };
  const fertilizerLevel = "56%";
  const plantsHealthy = true; 

  return (
    <div className="space-y-6">
      {/* Dashboard Banner */}
      <div className="rounded-lg bg-[hsl(var(--dashboard-banner-background))] p-6 shadow">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--dashboard-banner-title-foreground))]">Dashboard</h1>
        <p className="text-[hsl(var(--dashboard-banner-foreground))] mt-1">
          Monitor your plant care system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Plants" value={activePlants} icon={Leaf} />
        <StatCard title="Active Sensors" value={activeSensors} icon={Settings2} />
        <StatCard 
          title="Water Level" 
          value={waterLevel.value} 
          icon={Droplets} 
          description={waterLevel.status}
          descriptionClassName={waterLevel.isLow ? "text-destructive font-semibold" : "text-muted-foreground"}
        />
        <StatCard title="Fertilizer Level" value={fertilizerLevel} icon={PackageSearch} />
      </div>

      {/* Plants Needing Attention Card */}
      <Card className="shadow-sm rounded-lg">
        <CardHeader className="flex flex-row items-center space-x-3 rounded-t-lg bg-[hsl(var(--attention-header-background))] p-4">
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--attention-header-foreground))]" />
          <CardTitle className="text-md font-semibold text-[hsl(var(--attention-header-foreground))]" >
            Plants Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 text-center">
          {plantsHealthy ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-2" />
              <p className="text-lg sm:text-xl font-semibold text-card-foreground">All Plants Are Healthy</p>
              <p className="text-sm text-muted-foreground">No actions required at this time</p>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center gap-3 py-4">
              <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-2" />
              <p className="text-lg sm:text-xl font-semibold text-destructive">Some plants need attention!</p>
              <p className="text-sm text-muted-foreground">Check device details for more information.</p>
              {/* Add a list or details of plants needing attention here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
