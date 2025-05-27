import { RegisterDeviceForm } from '@/components/devices/register-device-form';

export default function RegisterDevicePage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Register a New Device</h1>
        <p className="text-muted-foreground">
          Follow the steps below to add your Yucca device.
        </p>
      </div>
      <RegisterDeviceForm />
    </div>
  );
}
