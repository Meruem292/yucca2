import Link from 'next/link';
import { mockDevices } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { DeviceListItem } from '@/components/devices/device-list-item';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


export default function DevicesPage() {
  const devices = mockDevices; // Fetch devices in a real app

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Devices</h1>
          <p className="text-muted-foreground">
            Manage your registered Yucca devices or add a new one.
          </p>
        </div>
        <Button asChild>
          <Link href="/devices/register">
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New Device
          </Link>
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card className="text-center py-12">
        <CardHeader>
          <CardTitle className="text-2xl">No Devices Registered</CardTitle>
          <CardDescription>
            It looks like you haven&apos;t added any Yucca devices yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <img src="https://placehold.co/300x200.png" alt="No devices" data-ai-hint="empty state devices" className="mx-auto mb-6 rounded-lg shadow-md" />
        </CardContent>
         <CardFooter className="justify-center">
            <Button asChild size="lg">
            <Link href="/devices/register">
              <PlusCircle className="mr-2 h-4 w-4" />
              Register Your First Device
            </Link>
          </Button>
         </CardFooter>
      </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceListItem key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
