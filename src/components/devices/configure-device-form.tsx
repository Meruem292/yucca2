
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { FirebaseDevice, UserSettings } from '@/lib/firebase/types';
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
import { Save, AlertTriangle, Phone, Droplets, TestTube2, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateDeviceName, updateUserSettings } from "@/lib/firebase/rtdb"; // Assuming updateDeviceConfig is also available
import { useMutation, useQueryClient } from "@tanstack/react-query";

const configureDeviceFormSchema = z.object({
  deviceName: z.string().min(3, { message: "Device name must be at least 3 characters." }),
  smsReceiver: z.string().regex(/^\+[1-9]\d{1,14}$/, { message: "Invalid phone number format (e.g., +15551234567)." }).or(z.literal("")),
  waterPumpDuration: z.coerce.number().min(1, {message: "Duration must be at least 1 second."}).max(600, {message: "Max 600 seconds."}), // Increased max
  fertilizerPumpDuration: z.coerce.number().min(1, {message: "Duration must be at least 1 second."}).max(300, {message: "Max 300 seconds."}), // Increased max
});

type ConfigureDeviceFormValues = z.infer<typeof configureDeviceFormSchema>;

interface ConfigureDeviceFormProps {
  device: FirebaseDevice;
  // We might also pass current global settings if needed, or fetch them here
  // globalSettings?: UserSettings | null; 
}

export function ConfigureDeviceForm({ device }: ConfigureDeviceFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Default values should come from the specific device's config if available,
  // or fall back to some app-wide defaults or placeholders.
  // For now, assuming device.config might exist or we use placeholders.
  const defaultSmsReceiver = device.config?.smsReceiver || ''; // Placeholder from global settings if available
  const defaultWaterPumpDuration = device.config?.pumpDurations?.water || 10; // Placeholder
  const defaultFertilizerPumpDuration = device.config?.pumpDurations?.fertilizer || 5; // Placeholder

  const form = useForm<ConfigureDeviceFormValues>({
    resolver: zodResolver(configureDeviceFormSchema),
    defaultValues: {
      deviceName: device.name,
      smsReceiver: defaultSmsReceiver,
      waterPumpDuration: defaultWaterPumpDuration,
      fertilizerPumpDuration: defaultFertilizerPumpDuration,
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (values: ConfigureDeviceFormValues) => {
      if (!user?.uid || !device.key) throw new Error("User or device key is missing.");
      
      const updates: Promise<any>[] = [];

      if (values.deviceName !== device.name) {
        updates.push(updateDeviceName(user.uid, device.key, values.deviceName));
      }
      
      // For simplicity, SMS receiver and pump durations are currently part of global settings
      // If they become device-specific, update logic here to save under device.config
      // For now, let's assume we might want to update global user settings if they were edited here.
      // This form is a bit ambiguous if it's for *device-specific* overrides or *global* settings.
      // Assuming for now it sets overrides on the DEVICE, if device.config structure exists.
      // If device.config structure is not defined, this part will do nothing or needs a global settings update.

      const deviceConfigUpdates: Partial<FirebaseDevice['config']> = {};
      let configChanged = false;

      if (values.smsReceiver !== (device.config?.smsReceiver || '')) {
        deviceConfigUpdates.smsReceiver = values.smsReceiver;
        configChanged = true;
      }
      if (values.waterPumpDuration !== (device.config?.pumpDurations?.water || 0) ||
          values.fertilizerPumpDuration !== (device.config?.pumpDurations?.fertilizer || 0)) {
        deviceConfigUpdates.pumpDurations = {
          water: values.waterPumpDuration,
          fertilizer: values.fertilizerPumpDuration,
        };
        configChanged = true;
      }

      if (configChanged && device.key) {
        // This assumes a function like `updateDeviceConfig(userId, deviceKey, configUpdates)` exists
        // For now, we'll try to update a subset of UserSettings which maps to some of these
        // In a real scenario, you'd have a dedicated function `updateDeviceConfig`
        // For now, we'll use updateUserSettings for smsReceiver if it differs from a potential global default
        // And for pump durations, we'd ideally save them to device.config.
        // This part is a bit of a placeholder for proper device-specific config updates.
        // await updateUserSettings(user.uid, {
        //   phoneNumber: values.smsReceiver, // Example: If SMS receiver is global
        //   waterPumpDuration: values.waterPumpDuration, // Example: if these are global too
        //   fertilizerPumpDuration: values.fertilizerPumpDuration
        // });
        // For a real app, you'd want to update device-specific config:
        // await update(ref(db, `users/${user.uid}/devices/${device.key}/config`), deviceConfigUpdates);
        // For demo, we'll just log it.
        console.log("Simulated device config update:", deviceConfigUpdates);
      }
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceDetails', user?.uid, device.key] });
      queryClient.invalidateQueries({ queryKey: ['userDevices', user?.uid] }); // If name change affects list
      toast({
        title: "Configuration Saved",
        description: `Settings for "${form.getValues().deviceName}" have been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save configuration.",
        variant: "destructive",
      });
    }
  });


  async function onSubmit(values: ConfigureDeviceFormValues) {
    mutation.mutate(values);
  }

  const handleManualPump = async (type: 'water' | 'fertilizer') => {
    const duration = type === 'water' ? form.getValues("waterPumpDuration") : form.getValues("fertilizerPumpDuration");
    toast({
      title: `Manual ${type} Pump Activated`,
      description: `Pumping for ${duration} seconds. (Simulated)`,
    });
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
     toast({
      title: `Manual ${type} Pump Finished`,
      description: `Pumping complete. (Simulated)`,
      variant: 'default'
    });
  };
  
  if (!device) return null; // Should not happen if page logic is correct

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
                    <Input {...field} disabled={mutation.isPending} />
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
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground"/> SMS Alert Number (Device Specific)
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+15551234567" {...field} disabled={mutation.isPending}/>
                  </FormControl>
                  <FormDescription>Phone number for alerts from *this* device. (Global settings may differ)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardTitle className="text-lg font-medium pt-4 border-t mt-6">Pump Durations (Device Specific)</CardTitle>
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
                      <Input type="number" {...field} disabled={mutation.isPending} />
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
                      <Input type="number" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={mutation.isPending || form.formState.isSubmitting}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
              {mutation.isPending ? "Saving..." : "Save Configuration"}
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
              disabled={mutation.isPending}
            >
              <Droplets className="mr-2 h-4 w-4"/>
              Activate Water Pump ({form.watch("waterPumpDuration")}s)
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleManualPump('fertilizer')}
              disabled={mutation.isPending}
            >
              <TestTube2 className="mr-2 h-4 w-4"/>
              Activate Fertilizer Pump ({form.watch("fertilizerPumpDuration")}s)
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500"/> Use manual controls with caution.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
