"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Device } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, AlertTriangle, Phone, Droplets, TestTube2, Zap } from "lucide-react";

const configureDeviceFormSchema = z.object({
  deviceName: z.string().min(3, { message: "Device name must be at least 3 characters." }),
  smsReceiver: z.string().regex(/^\+[1-9]\d{1,14}$/, { message: "Invalid phone number format (e.g., +15551234567)." }),
  waterPumpDuration: z.coerce.number().min(1, {message: "Duration must be at least 1 second."}).max(60, {message: "Max 60 seconds."}),
  fertilizerPumpDuration: z.coerce.number().min(1, {message: "Duration must be at least 1 second."}).max(30, {message: "Max 30 seconds."}),
});

type ConfigureDeviceFormValues = z.infer<typeof configureDeviceFormSchema>;

interface ConfigureDeviceFormProps {
  device: Device;
}

export function ConfigureDeviceForm({ device }: ConfigureDeviceFormProps) {
  const { toast } = useToast();

  const form = useForm<ConfigureDeviceFormValues>({
    resolver: zodResolver(configureDeviceFormSchema),
    defaultValues: {
      deviceName: device.name,
      smsReceiver: device.config.smsReceiver,
      waterPumpDuration: device.config.pumpDurations.water,
      fertilizerPumpDuration: device.config.pumpDurations.fertilizer,
    },
  });

  async function onSubmit(values: ConfigureDeviceFormValues) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Updating device configuration:", values);
    toast({
      title: "Configuration Saved",
      description: `Settings for "${values.deviceName}" have been updated.`,
    });
    // Here you would typically update the device data source
    device.name = values.deviceName;
    device.config.smsReceiver = values.smsReceiver;
    device.config.pumpDurations.water = values.waterPumpDuration;
    device.config.pumpDurations.fertilizer = values.fertilizerPumpDuration;
  }

  const handleManualPump = async (type: 'water' | 'fertilizer') => {
    const duration = type === 'water' ? form.getValues("waterPumpDuration") : form.getValues("fertilizerPumpDuration");
    toast({
      title: `Manual ${type} Pump Activated`,
      description: `Pumping for ${duration} seconds. (Simulated)`,
    });
    // Simulate pump action
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
     toast({
      title: `Manual ${type} Pump Finished`,
      description: `Pumping complete. (Simulated)`,
      variant: 'default'
    });
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Device Configuration</CardTitle>
        <CardDescription>Manage settings and manual controls for {device.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smsReceiver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground"/> SMS Alert Number
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormDescription>Phone number to receive critical alerts.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardTitle className="text-lg font-medium pt-4 border-t mt-6">Pump Durations</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="waterPumpDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Droplets className="mr-2 h-4 w-4 text-blue-500"/> Water Pump (seconds)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fertilizerPumpDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <TestTube2 className="mr-2 h-4 w-4 text-green-500"/> Fertilizer Pump (seconds)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4"/>
              {form.formState.isSubmitting ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Zap className="mr-2 h-5 w-5 text-accent"/>
            Manual Pump Control
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleManualPump('water')}
            >
              <Droplets className="mr-2 h-4 w-4"/>
              Activate Water Pump ({form.watch("waterPumpDuration")}s)
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleManualPump('fertilizer')}
            >
              <TestTube2 className="mr-2 h-4 w-4"/>
              Activate Fertilizer Pump ({form.watch("fertilizerPumpDuration")}s)
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3 text-amber-500"/> Use manual controls with caution.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
