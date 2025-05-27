
import Link from 'next/link';
import { mockDevices } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings/settings-form';
import { Plus, Settings as SettingsIcon } from 'lucide-react';

export default async function SettingsPage() {
  const devices = mockDevices; // In a real app, you might fetch this from a database

  return (
    <div className="space-y-8">
      <div className="bg-[hsl(var(--settings-card-background))] text-[hsl(var(--settings-card-foreground))] p-6 rounded-lg shadow">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Device Configuration</h1>
      </div>

      {/* Device Configuration Card */}
      <Card className="bg-[hsl(var(--settings-card-background))] text-[hsl(var(--settings-card-foreground))] shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Device Configuration</CardTitle>
          <CardDescription className="text-[hsl(var(--settings-card-foreground))] opacity-80">
            Add and manage your connected devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => (
            <Link key={device.id} href={`/devices/${device.id}`} passHref>
              <div className="flex items-center justify-between p-3 hover:bg-primary/10 rounded-md transition-colors cursor-pointer border border-border">
                <div>
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-sm opacity-70">{device.location}</p>
                </div>
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
            </Link>
          ))}
          <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/devices/register">
              <Plus className="mr-2 h-4 w-4" /> Add New Device
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* SMS Notifications and Actions Card */}
      <SettingsForm />

    </div>
  );
}
