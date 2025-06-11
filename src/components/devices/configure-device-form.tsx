
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
import { Save, AlertTriangle, Phone, Droplets, TestTube2, Zap, Loader2, Ruler } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateDeviceManualPumpState, updateDeviceConfig, updateDeviceProperties } from "@/lib/firebase/rtdb"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";

const configureDeviceFormSchema = z.object({
  deviceName: z.string().min(3, { message: "Device name must be at least 3 characters." }),
  smsReceiver: z.string().regex(/^\+[1-9]\d{1,14}$/, { message: "Invalid phone number format (e.g., +15551234567)." }).or(z.literal("")),
  waterPumpDuration: z.coerce.number().min(1, {message: "Duration must be at least 1 second."}).max(600, {message: "Max 600 seconds."}),
  fertilizerPumpDuration: z.coerce.number().min(1, {message: "Duration must be at least 1 second."}).max(300, {message: "Max 300 seconds."}),
  waterContainerHeight: z.coerce.number().min(1, {message: "Height must be at least 1 cm."}).max(500, {message: "Max 500 cm."}),
  fertilizerContainerHeight: z.coerce.number().min(1, {message: "Height must be at least 1 cm."}).max(500, {message: "Max 500 cm."}),
});

type ConfigureDeviceFormValues = z.infer<typeof configureDeviceFormSchema>;

interface ConfigureDeviceFormProps {
  device: FirebaseDevice;
}

export function ConfigureDeviceForm({ device }: ConfigureDeviceFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const deviceKey = device.key;

  const defaultSmsReceiver = device.smsReceiver || '';
  const defaultWaterPumpDuration = device.config?.pumpDurations?.water || 10; 
  const defaultFertilizerPumpDuration = device.config?.pumpDurations?.fertilizer || 5;
  const defaultWaterContainerHeight = device.config?.containerHeights?.water || 30;
  const defaultFertilizerContainerHeight = device.config?.containerHeights?.fertilizer || 20;


  const form = useForm<ConfigureDeviceFormValues>({
    resolver: zodResolver(configureDeviceFormSchema),
    defaultValues: {
      deviceName: device.name,
      smsReceiver: defaultSmsReceiver,
      waterPumpDuration: defaultWaterPumpDuration,
      fertilizerPumpDuration: defaultFertilizerPumpDuration,
      waterContainerHeight: defaultWaterContainerHeight,
      fertilizerContainerHeight: defaultFertilizerContainerHeight,
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (values: ConfigureDeviceFormValues) => {
      if (!user?.uid || !device.key) throw new Error("User or device key is missing.");
      
      const devicePropertyUpdates: Partial<Pick<FirebaseDevice, 'name' | 'smsReceiver'>> = {};
      if (values.deviceName !== device.name) {
        devicePropertyUpdates.name = values.deviceName;
      }
      const currentSmsReceiver = device.smsReceiver || '';
      if (values.smsReceiver !== currentSmsReceiver) {
         // Allow setting to empty string if it was previously defined, or from empty to defined
        devicePropertyUpdates.smsReceiver = values.smsReceiver;
      }

      if (Object.keys(devicePropertyUpdates).length > 0) {
        await updateDeviceProperties(user.uid, device.key, devicePropertyUpdates);
      }
      
      const deviceConfigPayload: Partial<Pick<FirebaseDevice, 'config'>['config']> = {
        pumpDurations: {
          water: values.waterPumpDuration,
          fertilizer: values.fertilizerPumpDuration,
        },
        containerHeights: {
            water: values.waterContainerHeight,
            fertilizer: values.fertilizerContainerHeight,
        }
      };
      
      // Always attempt to update config (pump durations, container heights) if the form is submitted.
      await updateDeviceConfig(user.uid, device.key, deviceConfigPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceDetails', user?.uid, device.key] });
      queryClient.invalidateQueries({ queryKey: ['userDevices', user?.uid] }); 
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
    if (!user?.uid || !deviceKey) {
      toast({
        title: "Error",
        description: "User or device information is missing to control pump.",
        variant: "destructive",
      });
      return;
    }

    const duration = type === 'water' ? form.getValues("waterPumpDuration") : form.getValues("fertilizerPumpDuration");

    try {
      await updateDeviceManualPumpState(user.uid, deviceKey, type, true);
      toast({
        title: `Manual ${type} Pump Activated`,
        description: `Pumping for ${duration} seconds. State: ON in Firebase.`,
      });
    } catch (activationError) {
      toast({
        title: `Activation Failed`,
        description: `Could not activate ${type} pump in Firebase. ${(activationError as Error).message}`,
        variant: "destructive",
      });
      return; 
    }

    await new Promise(resolve => setTimeout(resolve, duration * 1000));

    try {
      await updateDeviceManualPumpState(user.uid, deviceKey, type, false);
      toast({
        title: `Manual ${type} Pump Finished`,
        description: `Pumping complete. State: OFF in Firebase.`,
        variant: 'default'
      });
    } catch (deactivationError) {
      toast({
        title: `Deactivation Failed`,
        description: `Could not deactivate ${type} pump in Firebase. ${(deactivationError as Error).message}`,
        variant: "destructive",
      });
      console.error(`CRITICAL: Failed to set ${type} pump state to OFF for device ${deviceKey} after duration.`);
    }
  };
  
  if (!device) return null;

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

            <CardTitle className="text-lg font-medium pt-4 border-t mt-6">Container Heights (Device Specific)</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="waterContainerHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Ruler className="mr-2 h-4 w-4 text-blue-500"/> Water Container Height (cm)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormDescription>Total height of the water container in centimeters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fertilizerContainerHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Ruler className="mr-2 h-4 w-4 text-green-500"/> Fertilizer Container Height (cm)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={mutation.isPending} />
                    </FormControl>
                    <FormDescription>Total height of the fertilizer container in centimeters.</FormDescription>
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
// Added missing import for rtdb and update from firebase/database in ConfigureDeviceForm
import { rtdb } from '@/lib/firebase/config';
// update function is not directly used here anymore, but ref might be used by other parts of the file if not cleaned up.
// For now, keeping it, but it's not strictly necessary for the current changes.
import { ref, update } from 'firebase/database';

