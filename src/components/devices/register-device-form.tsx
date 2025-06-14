
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Added for loading state

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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, CheckCircle, Loader2 } from 'lucide-react'; // Added Loader2

import { useAuth } from "@/hooks/useAuth"; // Added
import { registerNewDevice } from "@/lib/firebase/rtdb"; // Added

const registerDeviceFormSchema = z.object({
  deviceName: z.string().min(3, { message: "Device name must be at least 3 characters." }),
  uniqueId: z.string().regex(/^YUCCA-[A-Z0-9]{3}-[A-Z0-9]{3}$/, { message: "Invalid Unique ID format (e.g., YUCCA-ABC-123)." }),
  location: z.string().optional(), // Optional location field, can be expanded later
  useDefaultSettings: z.boolean().default(false).optional(),
});

type RegisterDeviceFormValues = z.infer<typeof registerDeviceFormSchema>;

export function RegisterDeviceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const form = useForm<RegisterDeviceFormValues>({
    resolver: zodResolver(registerDeviceFormSchema),
    defaultValues: {
      deviceName: "",
      uniqueId: "",
      location: "", // Initialize location
      useDefaultSettings: true,
    },
  });

  async function onSubmit(values: RegisterDeviceFormValues) {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to register a device.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const deviceKey = await registerNewDevice(
        user.uid,
        values.deviceName,
        values.uniqueId,
        values.location || "Default Location", // Pass location or a default
        values.useDefaultSettings || false
      );

      if (deviceKey) {
        toast({
          title: "Device Registered!",
          description: `Device "${values.deviceName}" has been added to your account.`,
        });
        router.push("/devices"); // Redirect to devices list
        // Optionally, could redirect to the new device's detail page:
        // router.push(`/devices/${deviceKey}`);
      } else {
        throw new Error("Failed to get device key after registration.");
      }
    } catch (error: any) {
      console.error("Device registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register the device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Smartphone className="mr-3 h-7 w-7 text-primary" />
          Register New Yucca Device
        </CardTitle>
        <CardDescription>
          Enter the details for your new Yucca device to link it to your account.
        </CardDescription>
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
                    <Input placeholder="e.g., Living Room Orchid" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>
                    Give your device a friendly name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uniqueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unique Device ID</FormLabel>
                  <FormControl>
                    <Input placeholder="YUCCA-XXX-YYY" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>
                    Found on the device packaging or sticker.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Balcony, Bedroom" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>
                    Where is this device located?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="useDefaultSettings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Use default settings
                    </FormLabel>
                    <FormDescription>
                      Start with recommended settings for pump durations, container heights, and alert thresholds. You can change them later.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5"/>}
              {isLoading ? "Registering..." : "Register Device"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
